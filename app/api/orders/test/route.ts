import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    console.log("🧪 Testing orders connection...")

    // Consulta simple para probar la conexión
    const simpleQuery = `
      query TestOrdersConnection {
        orders(first: 1) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query: simpleQuery })

    console.log("📋 Test response:", JSON.stringify(response, null, 2))

    if (response.errors) {
      return NextResponse.json({
        success: false,
        error: "GraphQL Errors",
        details: response.errors,
        message: "Hay errores en la consulta GraphQL",
      })
    }

    if (!response.data) {
      return NextResponse.json({
        success: false,
        error: "No Data",
        message: "No se recibieron datos de Shopify",
      })
    }

    const ordersCount = response.data.orders?.edges?.length || 0

    return NextResponse.json({
      success: true,
      message: `Conexión exitosa. Se encontraron ${ordersCount} pedidos en la consulta de prueba.`,
      data: {
        ordersFound: ordersCount,
        firstOrder: response.data.orders?.edges?.[0]?.node || null,
      },
    })
  } catch (error) {
    console.error("❌ Error testing orders connection:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        message: "Error al probar la conexión de pedidos",
      },
      { status: 500 },
    )
  }
}
