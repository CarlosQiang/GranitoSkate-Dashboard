import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { shopifyFetch, extractIdFromGid } from "@/lib/shopify-client"
import { query, logSyncEvent } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "50")
    const cursor = searchParams.get("cursor")

    // Consulta GraphQL para obtener colecciones
    const graphqlQuery = `
      query getCollections($limit: Int!, $cursor: String) {
        collections(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              handle
              productsCount
              image {
                url
                altText
              }
              ruleSet {
                rules {
                  column
                  relation
                  condition
                }
              }
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        limit,
        cursor,
      },
    })

    // Procesar las colecciones
    const collections = response.data.collections.edges.map((edge) => edge.node)
    const pageInfo = response.data.collections.pageInfo

    // Sincronizar colecciones con la base de datos
    const syncResults = await Promise.allSettled(
      collections.map(async (collection) => {
        try {
          await syncCollectionToDatabase(collection)
          return { id: collection.id, success: true }
        } catch (error) {
          console.error(`Error al sincronizar colección ${collection.id}:`, error)
          return { id: collection.id, success: false, error: error.message }
        }
      }),
    )

    // Contar éxitos y errores
    const successCount = syncResults.filter((result) => result.status === "fulfilled" && result.value.success).length
    const errorCount = syncResults.filter(
      (result) => result.status === "rejected" || (result.status === "fulfilled" && !result.value.success),
    ).length

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "colecciones",
      accion: "sincronizar",
      resultado: errorCount === 0 ? "completado" : "parcial",
      mensaje: `Sincronización de colecciones: ${successCount} éxitos, ${errorCount} errores`,
      detalles: {
        total: collections.length,
        exitos: successCount,
        errores: errorCount,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        collections,
        pageInfo,
        syncResults: {
          total: collections.length,
          success: successCount,
          error: errorCount,
        },
      },
    })
  } catch (error) {
    console.error("Error al sincronizar colecciones:", error)

    // Registrar evento de error
    await logSyncEvent({
      tipo_entidad: "colecciones",
      accion: "sincronizar",
      resultado: "error",
      mensaje: `Error al sincronizar colecciones: ${error.message || "Error desconocido"}`,
      detalles: { error: error.message },
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al sincronizar colecciones",
      },
      { status: 500 },
    )
  }
}

// Función para sincronizar una colección con la base de datos
async function syncCollectionToDatabase(collection) {
  // Extraer el ID numérico de Shopify
  const shopifyId = extractIdFromGid(collection.id)

  // Verificar si la colección ya existe en la base de datos
  const existingCollection = await query("SELECT * FROM colecciones WHERE shopify_id = $1", [shopifyId])

  // Preparar los datos de la colección
  const collectionData = {
    shopify_id: shopifyId,
    titulo: collection.title,
    descripcion: collection.description || null,
    handle: collection.handle || null,
    imagen_url: collection.image?.url || null,
    cantidad_productos: collection.productsCount || 0,
    metadatos: JSON.stringify({
      ruleSet: collection.ruleSet || null,
      products:
        collection.products?.edges?.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
        })) || [],
    }),
  }

  // Si la colección ya existe, actualizarla
  if (existingCollection.rows.length > 0) {
    const collectionId = existingCollection.rows[0].id

    await query(
      `UPDATE colecciones SET
        titulo = $1,
        descripcion = $2,
        handle = $3,
        imagen_url = $4,
        cantidad_productos = $5,
        metadatos = $6,
        fecha_actualizacion = NOW()
      WHERE id = $7`,
      [
        collectionData.titulo,
        collectionData.descripcion,
        collectionData.handle,
        collectionData.imagen_url,
        collectionData.cantidad_productos,
        collectionData.metadatos,
        collectionId,
      ],
    )

    // Actualizar relaciones con productos
    await syncCollectionProducts(collectionId, collection)

    return { id: collectionId, updated: true }
  } else {
    // Crear nueva colección
    const result = await query(
      `INSERT INTO colecciones (
        shopify_id, titulo, descripcion, handle, imagen_url,
        cantidad_productos, metadatos, fecha_creacion, fecha_actualizacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING id`,
      [
        collectionData.shopify_id,
        collectionData.titulo,
        collectionData.descripcion,
        collectionData.handle,
        collectionData.imagen_url,
        collectionData.cantidad_productos,
        collectionData.metadatos,
      ],
    )

    const collectionId = result.rows[0].id

    // Sincronizar productos de la colección
    await syncCollectionProducts(collectionId, collection)

    return { id: collectionId, created: true }
  }
}

// Función para sincronizar los productos de una colección
async function syncCollectionProducts(collectionId, collection) {
  // Eliminar relaciones existentes
  await query("DELETE FROM productos_colecciones WHERE coleccion_id = $1", [collectionId])

  // Si la colección tiene productos, insertarlos
  if (collection.products?.edges?.length > 0) {
    for (let i = 0; i < collection.products.edges.length; i++) {
      const product = collection.products.edges[i].node
      const productShopifyId = extractIdFromGid(product.id)

      // Buscar el producto en la base de datos
      const productResult = await query("SELECT id FROM productos WHERE shopify_id = $1", [productShopifyId])

      // Si el producto existe, crear la relación
      if (productResult.rows.length > 0) {
        const productId = productResult.rows[0].id

        await query(
          `INSERT INTO productos_colecciones (
            producto_id, coleccion_id, posicion, fecha_creacion, fecha_actualizacion
          ) VALUES (
            $1, $2, $3, NOW(), NOW()
          )`,
          [productId, collectionId, i],
        )
      }
    }
  }
}
