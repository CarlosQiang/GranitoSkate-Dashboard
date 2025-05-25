import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { shopDomain, accessToken } = await request.json()

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan credenciales de Shopify",
        },
        { status: 400 },
      )
    }

    // Probar la conexión con Shopify
    const endpoint = `https://${shopDomain}/admin/api/2024-01/graphql.json`

    const query = `
      query {
        shop {
          name
          id
          url
          primaryDomain {
            url
          }
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
      return NextResponse.json(
        {
          success: false,
          message: `Error HTTP ${response.status}: ${response.statusText}`,
        },
        { status: 400 },
      )
    }

    const result = await response.json()

    if (result.errors) {
      return NextResponse.json(
        {
          success: false,
          message: `Error de GraphQL: ${result.errors.map((e: any) => e.message).join(", ")}`,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Conexión exitosa con ${result.data?.shop?.name || "Shopify"}`,
      data: result.data,
    })
  } catch (error) {
    console.error("Error testing Shopify connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al probar la conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
      },
      { status: 500 },
    )
  }
}
