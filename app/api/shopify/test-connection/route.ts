import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shopDomain, accessToken } = body

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan parámetros: shopDomain y accessToken son requeridos",
        },
        { status: 400 },
      )
    }

    // Construir la URL del endpoint
    const domain = shopDomain.includes(".myshopify.com") ? shopDomain : `${shopDomain}.myshopify.com`
    const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`

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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Error HTTP ${response.status}: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const result = await response.json()

    if (result.errors) {
      return NextResponse.json(
        {
          success: false,
          message: `Error de GraphQL: ${result.errors.map((e: any) => e.message).join(", ")}`,
          details: result.errors,
        },
        { status: 400 },
      )
    }

    if (!result.data || !result.data.shop) {
      return NextResponse.json(
        {
          success: false,
          message: "Respuesta inválida de Shopify",
          details: result,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Conexión exitosa con ${result.data.shop.name}`,
      data: result.data,
    })
  } catch (error) {
    console.error("Error testing Shopify connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
