import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

// Función para registrar la sincronización
async function registrarSincronizacion(
  tipoEntidad: string,
  entidadId: string | null,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles?: any,
) {
  try {
    await sql`
      INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha
      ) VALUES (
        ${tipoEntidad}, ${entidadId}, ${accion}, ${resultado}, ${mensaje}, 
        ${detalles ? JSON.stringify(detalles) : null}, NOW()
      )
    `
  } catch (error) {
    console.error("Error al registrar sincronización:", error)
  }
}

// Función para obtener productos de Shopify
async function obtenerProductosDeShopify(limit = 20) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "iniciado",
      `Obteniendo productos de Shopify (límite: ${limit})`,
    )

    // Consulta GraphQL para obtener productos
    const query = `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              publishedAt
              handle
              tags
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
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

    // Realizar la consulta a Shopify a través del proxy
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener productos de Shopify: respuesta vacía o inválida")
    }

    // Registrar éxito de la obtención
    const productCount = response.data.products.edges.length
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${productCount} productos de Shopify`,
    )

    return response.data.products.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "error",
      `Error al obtener productos de Shopify: ${error.message}`,
    )
    console.error("Error al obtener productos de Shopify:", error)
    throw error
  }
}

// Función para guardar productos en la base de datos
async function guardarProductosEnBD(productos) {
  try {
    // Registrar inicio del guardado
    await registrarSincronizacion(
      "productos",
      null,
      "guardar",
      "iniciado",
      `Guardando ${productos.length} productos en la base de datos`,
    )

    // Verificar si la tabla productos existe
    try {
      await sql`SELECT 1 FROM productos LIMIT 1`
    } catch (error) {
      // Si la tabla no existe, la creamos
      await sql`
        CREATE TABLE IF NOT EXISTS productos (
          id SERIAL PRIMARY KEY,
          shopify_id TEXT UNIQUE,
          titulo TEXT,
          descripcion TEXT,
          estado TEXT,
          tipo TEXT,
          proveedor TEXT,
          handle TEXT,
          etiquetas TEXT,
          precio TEXT,
          precio_comparacion TEXT,
          sku TEXT,
          inventario INTEGER,
          imagen_url TEXT,
          datos_adicionales JSONB,
          creado_en TIMESTAMP DEFAULT NOW(),
          actualizado_en TIMESTAMP DEFAULT NOW()
        )
      `
      console.log("Tabla productos creada")
    }

    // Guardar cada producto en la base de datos
    for (const producto of productos) {
      const shopifyId = producto.id.split("/").pop()
      const title = producto.title
      const description = producto.description || ""
      const status = producto.status
      const productType = producto.productType || ""
      const vendor = producto.vendor || ""
      const handle = producto.handle || ""
      const tags = producto.tags ? producto.tags.join(",") : ""

      // Obtener la primera variante para precio e inventario
      const firstVariant = producto.variants?.edges?.[0]?.node
      const price = firstVariant?.price || "0.00"
      const compareAtPrice = firstVariant?.compareAtPrice || null
      const sku = firstVariant?.sku || ""
      const inventoryQuantity = firstVariant?.inventoryQuantity || 0

      // Obtener la primera imagen
      const firstImage = producto.images?.edges?.[0]?.node
      const imageUrl = firstImage?.url || null

      // Datos adicionales en JSON
      const datosAdicionales = {
        allVariants: producto.variants?.edges?.map((e) => e.node) || [],
        allImages: producto.images?.edges?.map((e) => e.node) || [],
        publishedAt: producto.publishedAt,
      }

      // Verificar si el producto ya existe
      const existingProduct = await sql`
        SELECT id FROM productos WHERE shopify_id = ${shopifyId}
      `

      if (existingProduct.rows.length > 0) {
        // Actualizar producto existente
        await sql`
          UPDATE productos 
          SET 
            titulo = ${title},
            descripcion = ${description},
            estado = ${status},
            tipo = ${productType},
            proveedor = ${vendor},
            handle = ${handle},
            etiquetas = ${tags},
            precio = ${price},
            precio_comparacion = ${compareAtPrice},
            sku = ${sku},
            inventario = ${inventoryQuantity},
            imagen_url = ${imageUrl},
            datos_adicionales = ${JSON.stringify(datosAdicionales)},
            actualizado_en = NOW()
          WHERE shopify_id = ${shopifyId}
        `

        await registrarSincronizacion(
          "productos",
          shopifyId,
          "actualizar",
          "completado",
          `Producto actualizado: ${title}`,
        )
      } else {
        // Insertar nuevo producto
        await sql`
          INSERT INTO productos (
            shopify_id, titulo, descripcion, estado, tipo, proveedor, 
            handle, etiquetas, precio, precio_comparacion, sku, 
            inventario, imagen_url, datos_adicionales, creado_en, actualizado_en
          ) VALUES (
            ${shopifyId}, ${title}, ${description}, ${status}, ${productType}, ${vendor},
            ${handle}, ${tags}, ${price}, ${compareAtPrice}, ${sku},
            ${inventoryQuantity}, ${imageUrl}, ${JSON.stringify(datosAdicionales)}, NOW(), NOW()
          )
        `

        await registrarSincronizacion("productos", shopifyId, "crear", "completado", `Producto creado: ${title}`)
      }
    }

    // Registrar éxito del guardado
    await registrarSincronizacion(
      "productos",
      null,
      "guardar",
      "completado",
      `Se guardaron ${productos.length} productos en la base de datos`,
    )

    return { success: true, count: productos.length }
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "productos",
      null,
      "guardar",
      "error",
      `Error al guardar productos en la base de datos: ${error.message}`,
    )
    console.error("Error al guardar productos en la base de datos:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")

    // Obtener productos de Shopify
    const productos = await obtenerProductosDeShopify(limit)

    // Guardar productos en la base de datos
    const resultado = await guardarProductosEnBD(productos)

    return NextResponse.json({
      success: true,
      message: `Sincronización de productos completada. Se sincronizaron ${resultado.count} productos.`,
      count: resultado.count,
    })
  } catch (error: any) {
    console.error("Error en sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de productos",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
