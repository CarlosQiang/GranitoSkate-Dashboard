import { NextResponse } from "next/server"
import { sincronizarProductos } from "@/lib/services/sync-service"
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

    // Obtener productos de Shopify
    const query = `
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              productType
              vendor
              status
              publishedAt
              handle
              tags
              featuredImage {
                url
                altText
              }
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
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

    // Extraer productos de la respuesta
    const products = response.data.products.edges.map((edge) => edge.node)

    // Transformar los productos para guardarlos en la base de datos
    const transformedProducts = products.map((product) => {
      // Extraer el ID numérico
      const idParts = product.id.split("/")
      const shopifyId = idParts[idParts.length - 1]

      // Obtener la primera variante
      const firstVariant = product.variants.edges[0]?.node || {}

      // Obtener la primera imagen
      const featuredImage = product.featuredImage || product.images.edges[0]?.node || {}

      return {
        shopify_id: product.id,
        id_numerico: shopifyId,
        titulo: product.title,
        descripcion: product.description,
        descripcion_html: product.descriptionHtml,
        tipo_producto: product.productType,
        proveedor: product.vendor,
        estado: product.status,
        publicado_en: product.publishedAt,
        handle: product.handle,
        etiquetas: product.tags,
        imagen_url: featuredImage.url || null,
        imagen_alt: featuredImage.altText || null,
        precio: firstVariant.price || "0.00",
        precio_comparacion: firstVariant.compareAtPrice || null,
        sku: firstVariant.sku || null,
        codigo_barras: firstVariant.barcode || null,
        inventario: firstVariant.inventoryQuantity || 0,
        politica_inventario: firstVariant.inventoryPolicy || null,
        peso: firstVariant.weight || null,
        unidad_peso: firstVariant.weightUnit || null,
        variantes: JSON.stringify(product.variants.edges.map((edge) => edge.node)),
        imagenes: JSON.stringify(product.images.edges.map((edge) => edge.node)),
        metadatos: JSON.stringify(product.metafields.edges.map((edge) => edge.node)),
        actualizado_en: new Date().toISOString(),
      }
    })

    // Guardar los productos en la base de datos
    const savedProducts = []
    for (const product of transformedProducts) {
      try {
        // Verificar si el producto ya existe
        const existingProduct = await db.query("SELECT * FROM productos WHERE shopify_id = $1", [product.shopify_id])

        if (existingProduct.rows.length > 0) {
          // Actualizar el producto existente
          const updateResult = await db.query(
            `
            UPDATE productos SET
              titulo = $1,
              descripcion = $2,
              descripcion_html = $3,
              tipo_producto = $4,
              proveedor = $5,
              estado = $6,
              publicado_en = $7,
              handle = $8,
              etiquetas = $9,
              imagen_url = $10,
              imagen_alt = $11,
              precio = $12,
              precio_comparacion = $13,
              sku = $14,
              codigo_barras = $15,
              inventario = $16,
              politica_inventario = $17,
              peso = $18,
              unidad_peso = $19,
              variantes = $20,
              imagenes = $21,
              metadatos = $22,
              actualizado_en = $23
            WHERE shopify_id = $24
            RETURNING *
            `,
            [
              product.titulo,
              product.descripcion,
              product.descripcion_html,
              product.tipo_producto,
              product.proveedor,
              product.estado,
              product.publicado_en,
              product.handle,
              product.etiquetas,
              product.imagen_url,
              product.imagen_alt,
              product.precio,
              product.precio_comparacion,
              product.sku,
              product.codigo_barras,
              product.inventario,
              product.politica_inventario,
              product.peso,
              product.unidad_peso,
              product.variantes,
              product.imagenes,
              product.metadatos,
              product.actualizado_en,
              product.shopify_id,
            ],
          )

          savedProducts.push(updateResult.rows[0])
        } else {
          // Insertar un nuevo producto
          const insertResult = await db.query(
            `
            INSERT INTO productos (
              shopify_id,
              id_numerico,
              titulo,
              descripcion,
              descripcion_html,
              tipo_producto,
              proveedor,
              estado,
              publicado_en,
              handle,
              etiquetas,
              imagen_url,
              imagen_alt,
              precio,
              precio_comparacion,
              sku,
              codigo_barras,
              inventario,
              politica_inventario,
              peso,
              unidad_peso,
              variantes,
              imagenes,
              metadatos,
              creado_en,
              actualizado_en
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
              $21, $22, $23, $24, $25, $26
            )
            RETURNING *
            `,
            [
              product.shopify_id,
              product.id_numerico,
              product.titulo,
              product.descripcion,
              product.descripcion_html,
              product.tipo_producto,
              product.proveedor,
              product.estado,
              product.publicado_en,
              product.handle,
              product.etiquetas,
              product.imagen_url,
              product.imagen_alt,
              product.precio,
              product.precio_comparacion,
              product.sku,
              product.codigo_barras,
              product.inventario,
              product.politica_inventario,
              product.peso,
              product.unidad_peso,
              product.variantes,
              product.imagenes,
              product.metadatos,
              new Date().toISOString(),
              new Date().toISOString(),
            ],
          )

          savedProducts.push(insertResult.rows[0])
        }
      } catch (error) {
        console.error(`Error al guardar el producto ${product.titulo}:`, error)
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
      ["productos", savedProducts.length, JSON.stringify({ total: products.length }), new Date().toISOString()],
    )

    return NextResponse.json({
      success: true,
      message: `Se sincronizaron ${savedProducts.length} productos de ${products.length} obtenidos de Shopify`,
      data: {
        total: products.length,
        saved: savedProducts.length,
      },
    })
  } catch (error) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al sincronizar productos",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Sincronizar productos reales de Shopify
    const resultados = await sincronizarProductos(limit)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
