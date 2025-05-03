import { NextResponse } from "next/server"
import { getShopifyApi } from "@/lib/shopify"

export async function GET() {
  try {
    const shopify = await getShopifyApi()

    // Intentar hacer una consulta simple para verificar que la API funciona
    const response = await shopify.graphql(`
      query {
        shop {
          name
        }
      }
    `)

    const data = await response.json()

    if (data.errors) {
      return NextResponse.json(
        {
          success: false,
          message: data.errors[0]?.message || "Error en la API de Shopify",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "API de SEO conectada correctamente",
      shop: data.data.shop.name,
    })
  } catch (error) {
    console.error("Error checking SEO API:", error)

    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Error al conectar con la API de SEO",
      },
      { status: 500 },
    )
  }
}
