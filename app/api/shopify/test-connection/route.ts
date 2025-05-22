import { NextResponse } from "next/server"
import { getShopifyConfig } from "@/lib/config/shopify"

export async function GET() {
  try {
    const config = getShopifyConfig()

    if (!config.domain || !config.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan credenciales de Shopify. Por favor, configura el dominio y token de acceso.",
        },
        { status: 400 },
      )
    }

    // Construir la URL de la API de Shopify
    const apiUrl = `https://${config.domain}/admin/api/2023-07/shop.json`

    // Realizar la solicitud a la API de Shopify
    const response = await fetch(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": config.accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `Error ${response.status}: ${errorText}`,
          statusCode: response.status,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      shopName: data.shop.name,
      shopPlan: data.shop.plan_name,
      shopDomain: data.shop.domain,
      shopEmail: data.shop.email,
    })
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
