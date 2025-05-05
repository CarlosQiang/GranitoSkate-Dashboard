import { NextResponse } from "next/server"

export const maxDuration = 60 // 60 segundos de timeout

export async function POST(request: Request) {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Variables de entorno de Shopify no definidas")
      return NextResponse.json(
        {
          errors: [
            {
              message:
                "Variables de entorno de Shopify no definidas. Verifica NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
            },
          ],
        },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json().catch(() => null)

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`

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
      console.error(`Error en la respuesta de Shopify: ${shopifyResponse.status}`, errorText)
      return NextResponse.json(
        {
          errors: [
            {
              message: `Error en la respuesta de Shopify: ${shopifyResponse.status}`,
              details: errorText,
            },
          ],
        },
        { status: shopifyResponse.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        errors: [
          {
            message: error instanceof Error ? error.message : "Error desconocido en el proxy de Shopify",
          },
        ],
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Variables de entorno de Shopify no definidas")
      return NextResponse.json(
        {
          success: false,
          error:
            "Variables de entorno de Shopify no definidas. Verifica NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
        },
        { status: 200 },
      )
    }

    // Consulta simple para verificar la conexión
    const query = `
      {
        shop {
          name
          url
          primaryDomain {
            url
          }
        }
      }
    `

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`

    // Realizar la solicitud a la API de Shopify
    const shopifyResponse = await fetch(shopifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text()
      console.error(`Error en la respuesta de Shopify: ${shopifyResponse.status}`, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Error en la respuesta de Shopify: ${shopifyResponse.status}`,
        },
        { status: 200 },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json({
      success: true,
      shopName: data?.data?.shop?.name || "Tienda Shopify",
      shopUrl: data?.data?.shop?.primaryDomain?.url || data?.data?.shop?.url,
      message: "Conexión establecida correctamente",
    })
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido en el proxy de Shopify",
      },
      { status: 200 },
    )
  }
}
