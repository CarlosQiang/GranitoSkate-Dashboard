import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Obtener las credenciales de Shopify
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Verificar que las credenciales existen
    if (!shopDomain || !accessToken) {
      console.error("Faltan credenciales de Shopify:", { shopDomain: !!shopDomain, accessToken: !!accessToken })
      return NextResponse.json({ error: "Faltan credenciales de Shopify" }, { status: 500 })
    }

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-07/graphql.json`

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    console.log("Enviando solicitud a Shopify:", {
      url: shopifyApiUrl,
      query: body.query.substring(0, 100) + "...",
      variables: body.variables,
    })

    // Realizar la solicitud a la API de Shopify
    const shopifyResponse = await fetch(shopifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text()
      console.error("Error en la respuesta de Shopify:", {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        body: errorText,
      })
      return NextResponse.json(
        {
          error: `Error en la API de Shopify: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
          details: errorText,
        },
        { status: shopifyResponse.status },
      )
    }

    // Obtener la respuesta como JSON
    const data = await shopifyResponse.json()

    // Verificar si hay errores en la respuesta
    if (data.errors) {
      console.error("Errores en la respuesta de Shopify:", data.errors)
    }

    // Devolver la respuesta
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
