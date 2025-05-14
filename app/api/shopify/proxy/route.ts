import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
      return NextResponse.json(
        {
          errors: [{ message: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado" }],
        },
        { status: 500 },
      )
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          errors: [{ message: "SHOPIFY_ACCESS_TOKEN no está configurado" }],
        },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

    // Construir la URL de la API de Shopify
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyUrl = `https://${shopifyDomain}/admin/api/2023-10/graphql.json`

    // Realizar la solicitud a Shopify
    const shopifyResponse = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify(body),
    })

    // Si la respuesta no es exitosa, manejar el error
    if (!shopifyResponse.ok) {
      console.error("Error en la respuesta de Shopify:", {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
      })

      // Intentar obtener más detalles del error
      let errorDetails = {}
      try {
        errorDetails = await shopifyResponse.json()
      } catch (e) {
        // Si no se puede analizar la respuesta como JSON, usar el texto
        errorDetails = { text: await shopifyResponse.text() }
      }

      // Devolver una respuesta de error con detalles
      return NextResponse.json(
        {
          errors: [
            {
              message: `Error en la API de Shopify: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
              extensions: {
                response: {
                  status: shopifyResponse.status,
                  headers: Object.fromEntries(shopifyResponse.headers.entries()),
                },
                details: errorDetails,
              },
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
