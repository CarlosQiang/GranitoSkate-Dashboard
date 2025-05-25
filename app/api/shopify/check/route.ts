import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar que las variables de entorno estén configuradas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Variables de entorno de Shopify no configuradas",
          details: {
            shopDomain: !!shopDomain,
            accessToken: !!accessToken,
          },
        },
        { status: 400 },
      )
    }

    // Consulta simple para verificar la conexión
    const query = `
      query {
        shop {
          id
          name
          url
          primaryDomain {
            url
          }
          email
          currencyCode
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      return NextResponse.json(
        {
          success: false,
          error: "Error en la API de Shopify",
          details: response.errors,
        },
        { status: 500 },
      )
    }

    if (!response.data || !response.data.shop) {
      return NextResponse.json(
        {
          success: false,
          error: "Respuesta inválida de Shopify",
          details: response,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Conectado exitosamente con ${response.data.shop.name}`,
      shopName: response.data.shop.name,
      data: response.data,
    })
  } catch (error) {
    console.error("Error al verificar conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
