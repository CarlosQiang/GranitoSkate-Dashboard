import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json()

    console.log("🧪 Probando GraphQL con Shopify...")
    console.log("Query:", query)
    console.log("Variables:", variables)

    // Verificar credenciales
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales de Shopify no configuradas",
          details: {
            shop_domain: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
            access_token: !!process.env.SHOPIFY_ACCESS_TOKEN,
          },
        },
        { status: 500 },
      )
    }

    const shopifyUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`

    console.log("🔗 URL de Shopify:", shopifyUrl)
    console.log("🔑 Token disponible:", process.env.SHOPIFY_ACCESS_TOKEN ? "Sí" : "No")

    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables: variables || {},
      }),
    })

    console.log("📥 Respuesta de Shopify:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Error HTTP:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `HTTP Error: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("✅ Datos recibidos:", data)

    if (data.errors) {
      console.error("❌ Errores GraphQL:", data.errors)
      return NextResponse.json(
        {
          success: false,
          error: "GraphQL Errors",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    })
  } catch (error) {
    console.error("❌ Error en test GraphQL:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
