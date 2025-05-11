import { NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET() {
  try {
    // Consulta simple para verificar la conexión con Shopify
    const query = gql`
      {
        shop {
          name
          url
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.shop) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo conectar con la API de Shopify",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      shop: data.shop,
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al conectar con la API de Shopify",
      },
      { status: 500 },
    )
  }
}
