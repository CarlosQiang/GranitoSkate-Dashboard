import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      return NextResponse.json(
        {
          success: false,
          error: "Shopify environment variables not defined. Please check your .env file.",
        },
        { status: 500 },
      )
    }

    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Consulta GraphQL simple para verificar la conexión
    const query = `
      {
        shop {
          name
        }
      }
    `

    const response = await fetch(`https://${shopDomain}/admin/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `Error en la respuesta de Shopify: ${response.status} ${text}`,
        },
        { status: response.status },
      )
    }

    const { data, errors } = await response.json()

    if (errors) {
      return NextResponse.json(
        {
          success: false,
          error: `GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      shop: data.shop.name,
    })
  } catch (error) {
    console.error("Error checking Shopify connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar la conexión con Shopify",
      },
      { status: 500 },
    )
  }
}
