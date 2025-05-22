import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyFetch } from "@/lib/shopify"
import db from "@/lib/db"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener colecciones de Shopify
    const query = `
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              handle
              productsCount
              image {
                url
                altText
              }
              products(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      return NextResponse.json(
        {
          success: false,
          error: `Error en la API de Shopify: ${response.errors[0].message}`,
        },
        { status: 500 },
      )
    }

    // Extraer colecciones de la respuesta
    const collections = response.data.collections.edges.map((edge) => edge.node)

    // Transformar las colecciones para guardarlas en la base de datos
    const transformedCollections = collections.map((collection) => {
      // Extraer el ID numérico
      const idParts = collection.id.split("/")
      const shopifyId = idParts[idParts.length - 1]

      return {
        shopify_id: collection.id,
        id_numerico: shopifyId,
        titulo: collection.title,
        descripcion: collection.description,
        descripcion_html: collection.descriptionHtml,
        handle: collection.handle,
        cantidad_productos: collection.productsCount,
        imagen_url: collection.image?.url || null,
        imagen_alt: collection.image?.altText || null,
        productos: JSON.stringify(collection.products.edges.map((edge) => edge.node)),
        metadatos: JSON.stringify(collection.metafields.edges.map((edge) => edge.node)),
        actualizado_en: new Date().toISOString(),
      }
    })

    // Guardar las colecciones en la base de datos
    const savedCollections = []
    for (const collection of transformedCollections) {
      try {
        // Verificar si la colección ya existe
        const existingCollection = await db.query("SELECT * FROM colecciones WHERE shopify_id = $1", [
          collection.shopify_id,
        ])

        if (existingCollection.rows.length > 0) {
          // Actualizar la colección existente
          const updateResult = await db.query(
            `
            UPDATE colecciones SET
              titulo = $1,
              descripcion = $2,
              descripcion_html = $3,
              handle = $4,
              cantidad_productos = $5,
              imagen_url = $6,
              imagen_alt = $7,
              productos = $8,
              metadatos = $9,
              actualizado_en = $10
            WHERE shopify_id = $11
            RETURNING *
            `,
            [
              collection.titulo,
              collection.descripcion,
              collection.descripcion_html,
              collection.handle,
              collection.cantidad_productos,
              collection.imagen_url,
              collection.imagen_alt,
              collection.productos,
              collection.metadatos,
              collection.actualizado_en,
              collection.shopify_id,
            ],
          )

          savedCollections.push(updateResult.rows[0])
        } else {
          // Insertar una nueva colección
          const insertResult = await db.query(
            `
            INSERT INTO colecciones (
              shopify_id,
              id_numerico,
              titulo,
              descripcion,
              descripcion_html,
              handle,
              cantidad_productos,
              imagen_url,
              imagen_alt,
              productos,
              metadatos,
              creado_en,
              actualizado_en
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING *
            `,
            [
              collection.shopify_id,
              collection.id_numerico,
              collection.titulo,
              collection.descripcion,
              collection.descripcion_html,
              collection.handle,
              collection.cantidad_productos,
              collection.imagen_url,
              collection.imagen_alt,
              collection.productos,
              collection.metadatos,
              new Date().toISOString(),
              new Date().toISOString(),
            ],
          )

          savedCollections.push(insertResult.rows[0])
        }
      } catch (error) {
        console.error(`Error al guardar la colección ${collection.titulo}:`, error)
      }
    }

    // Registrar la sincronización
    await db.query(
      `
      INSERT INTO registro_sincronizacion (
        tipo,
        cantidad,
        detalles,
        fecha
      ) VALUES (
        $1, $2, $3, $4
      )
      `,
      ["colecciones", savedCollections.length, JSON.stringify({ total: collections.length }), new Date().toISOString()],
    )

    return NextResponse.json({
      success: true,
      message: `Se sincronizaron ${savedCollections.length} colecciones de ${collections.length} obtenidas de Shopify`,
      data: {
        total: collections.length,
        saved: savedCollections.length,
      },
    })
  } catch (error) {
    console.error("Error al sincronizar colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al sincronizar colecciones",
      },
      { status: 500 },
    )
  }
}
