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

    // Consulta GraphQL para obtener productos
    const graphqlQuery = `
      query getProducts($limit: Int!, $cursor: String) {
        products(first: $limit, after: $cursor) {
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
              productType
              vendor
              status
              publishedAt
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
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

    // Procesar los productos
    const products = response.data.products.edges.map((edge) => edge.node)
    const pageInfo = response.data.products.pageInfo

    // Sincronizar productos con la base de datos
    const syncResults = await Promise.allSettled(
      products.map(async (product) => {
        try {
          await syncProductToDatabase(product)
          return { id: product.id, success: true }
        } catch (error) {
          console.error(`Error al sincronizar producto ${product.id}:`, error)
          return { id: product.id, success: false, error: error.message }
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
      tipo_entidad: "productos",
      accion: "sincronizar",
      resultado: errorCount === 0 ? "completado" : "parcial",
      mensaje: `Sincronización de productos: ${successCount} éxitos, ${errorCount} errores`,
      detalles: {
        total: products.length,
        exitos: successCount,
        errores: errorCount,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        products,
        pageInfo,
        syncResults: {
          total: products.length,
          success: successCount,
          error: errorCount,
        },
      },
    })
  } catch (error) {
    console.error("Error al sincronizar productos:", error)

    // Registrar evento de error
    await logSyncEvent({
      tipo_entidad: "productos",
      accion: "sincronizar",
      resultado: "error",
      mensaje: `Error al sincronizar productos: ${error.message || "Error desconocido"}`,
      detalles: { error: error.message },
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al sincronizar productos",
      },
      { status: 500 },
    )
  }
}

// Función para sincronizar un producto con la base de datos
async function syncProductToDatabase(product) {
  // Extraer el ID numérico de Shopify
  const shopifyId = extractIdFromGid(product.id)

  // Verificar si el producto ya existe en la base de datos
  const existingProduct = await query("SELECT * FROM productos WHERE shopify_id = $1", [shopifyId])

  // Extraer la primera variante para obtener precio e inventario
  const firstVariant = product.variants?.edges?.[0]?.node || {}

  // Preparar los datos del producto
  const productData = {
    shopify_id: shopifyId,
    titulo: product.title,
    descripcion: product.description || null,
    tipo_producto: product.productType || null,
    proveedor: product.vendor || null,
    estado: product.status?.toLowerCase() || "active",
    publicado: product.publishedAt !== null,
    imagen_url: product.featuredImage?.url || null,
    handle: product.handle || null,
    precio: firstVariant.price ? Number.parseFloat(firstVariant.price) : 0,
    precio_comparacion: firstVariant.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice) : null,
    inventario: firstVariant.inventoryQuantity || 0,
    sku: firstVariant.sku || null,
    codigo_barras: firstVariant.barcode || null,
    metadatos: JSON.stringify({
      tags: product.tags || [],
      variants: product.variants?.edges?.map((edge) => edge.node) || [],
      images: product.featuredImage ? [product.featuredImage] : [],
    }),
  }

  // Si el producto ya existe, actualizarlo
  if (existingProduct.rows.length > 0) {
    const productId = existingProduct.rows[0].id

    await query(
      `UPDATE productos SET
        titulo = $1,
        descripcion = $2,
        tipo_producto = $3,
        proveedor = $4,
        estado = $5,
        publicado = $6,
        imagen_url = $7,
        handle = $8,
        precio = $9,
        precio_comparacion = $10,
        inventario = $11,
        sku = $12,
        codigo_barras = $13,
        metadatos = $14,
        fecha_actualizacion = NOW()
      WHERE id = $15`,
      [
        productData.titulo,
        productData.descripcion,
        productData.tipo_producto,
        productData.proveedor,
        productData.estado,
        productData.publicado,
        productData.imagen_url,
        productData.handle,
        productData.precio,
        productData.precio_comparacion,
        productData.inventario,
        productData.sku,
        productData.codigo_barras,
        productData.metadatos,
        productId,
      ],
    )

    return { id: productId, updated: true }
  } else {
    // Crear nuevo producto
    const result = await query(
      `INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, imagen_url, handle, precio, precio_comparacion,
        inventario, sku, codigo_barras, metadatos, fecha_creacion, fecha_actualizacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
      ) RETURNING id`,
      [
        productData.shopify_id,
        productData.titulo,
        productData.descripcion,
        productData.tipo_producto,
        productData.proveedor,
        productData.estado,
        productData.publicado,
        productData.imagen_url,
        productData.handle,
        productData.precio,
        productData.precio_comparacion,
        productData.inventario,
        productData.sku,
        productData.codigo_barras,
        productData.metadatos,
      ],
    )

    return { id: result.rows[0].id, created: true }
  }
}
