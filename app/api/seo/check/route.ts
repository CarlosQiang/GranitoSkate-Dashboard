import { NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"

export async function GET() {
  try {
    // Intentar hacer una consulta simple para verificar que la API funciona
    const query = `
      query {
        shop {
          name
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.shop) {
      return NextResponse.json(
        {
          success: false,
          message: "Error en la API de Shopify: No se pudo obtener información de la tienda",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "API de SEO conectada correctamente",
      shop: data.shop.name,
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
