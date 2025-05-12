import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Obtener las credenciales de Shopify desde las variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Faltan credenciales de Shopify en las variables de entorno")
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

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
      console.error(`Error en la respuesta de Shopify: ${shopifyResponse.status} ${errorText}`)
      return NextResponse.json(
        { error: `Error en la respuesta de Shopify: ${shopifyResponse.status}` },
        { status: shopifyResponse.status },
      )
    }

    // Obtener la respuesta como JSON
    const data = await shopifyResponse.json()

    // Devolver la respuesta
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      { error: `Error en el proxy de Shopify: ${error instanceof Error ? error.message : "Error desconocido"}` },
      { status: 500 },
    )
  }
}

// Endpoint para verificar la conexión con Shopify
export async function GET() {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Faltan credenciales de Shopify en las variables de entorno" },
        { status: 500 },
      )
    }

    // Hacer una solicitud simple para verificar la conexión
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`
    const response = await fetch(shopifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `{
          shop {
            name
            myshopifyDomain
          }
        }`,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Error en la respuesta de Shopify: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      message: "Conexión con Shopify establecida correctamente",
      shopName: data.data.shop.name,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Error al verificar la conexión con Shopify: ${error instanceof Error ? error.message : "Error desconocido"}`,
      },
      { status: 500 },
    )
  }
}
