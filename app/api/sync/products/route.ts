import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET(request: Request) {
  try {
    console.log("Iniciando sincronización de productos...")

    // Verificar variables de entorno
    if (!process.env.SHOPIFY_API_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "SHOPIFY_API_URL no está configurado",
        },
        { status: 500 },
      )
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "SHOPIFY_ACCESS_TOKEN no está configurado",
        },
        { status: 500 },
      )
    }

    // Consulta GraphQL simple para obtener productos
    const query = `
      query {
        products(first: 5) {
          edges {
            node {
              id
              title
              description
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      return NextResponse.json(
        {
          success: false,
          error: `Error en la API de Shopify: ${errorMessage}`,
          errors: response.errors,
        },
        { status: 500 },
      )
    }

    if (!response.data || !response.data.products) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudieron obtener productos de Shopify: respuesta vacía o inválida",
          response,
        },
        { status: 500 },
      )
    }

    // Extraer productos de la respuesta
    const productos = response.data.products.edges.map((edge) => edge.node)

    return NextResponse.json({
      success: true,
      message: `Se obtuvieron ${productos.length} productos de Shopify`,
      productos,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
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
