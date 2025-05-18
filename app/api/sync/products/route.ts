import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"
import { sql } from "@vercel/postgres"

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
async function obtenerProductosDeShopify(limit = 10) {
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

export async function GET(request: Request) {
  try {
    console.log("Iniciando sincronización de productos (simplificada)...")

    // Verificar la conexión a la base de datos
    try {
      const result = await sql`SELECT NOW()`
      console.log("Conexión a la base de datos establecida:", result)
    } catch (error) {
      console.error("Error al conectar con la base de datos:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error al conectar con la base de datos",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Sincronización completada (simplificada)")

    return NextResponse.json({
      success: true,
      message: "Sincronización completada (simplificada)",
    })
  } catch (error) {
    console.error("Error en la sincronización de productos (simplificada):", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
