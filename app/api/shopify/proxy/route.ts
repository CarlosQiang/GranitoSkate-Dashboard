import { NextResponse } from "next/server"
import config from "@/lib/config"

export async function POST(request: Request) {
  try {
    // Obtener el cuerpo de la solicitud
    const body = await request.json()

    // Verificar que las variables de entorno estén configuradas
    if (!config.shopify.shopDomain) {
      console.error("Error: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return NextResponse.json(
        {
          errors: [{ message: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado" }],
        },
        { status: 500 },
      )
    }

    if (!config.shopify.accessToken) {
      console.error("Error: SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json(
        {
          errors: [{ message: "SHOPIFY_ACCESS_TOKEN no está configurado" }],
        },
        { status: 500 },
      )
    }

    // Construir la URL de la API de Shopify
    const shopifyUrl = config.shopify.apiUrl || `https://${config.shopify.shopDomain}/admin/api/2023-07/graphql.json`

    console.log("Enviando solicitud a Shopify:", {
      url: shopifyUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "***", // No mostrar el token completo por seguridad
      },
      body: JSON.stringify(body).substring(0, 100) + "...", // Truncar para el log
    })

    // Realizar la solicitud a Shopify
    const shopifyResponse = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.shopify.accessToken,
      },
      body: JSON.stringify(body),
      cache: "no-store",
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
        try {
          errorDetails = { text: await shopifyResponse.text() }
        } catch (textError) {
          errorDetails = { message: "No se pudo leer la respuesta de error" }
        }
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

    // Verificar que la respuesta sea JSON válido
    const contentType = shopifyResponse.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Error: La respuesta de Shopify no es JSON válido:", contentType)

      // Obtener el texto de la respuesta para diagnóstico
      const responseText = await shopifyResponse.text()
      console.error("Respuesta no JSON:", responseText.substring(0, 200) + "...")

      return NextResponse.json(
        {
          errors: [
            {
              message: "La respuesta de Shopify no es JSON válido",
              extensions: {
                contentType,
                preview: responseText.substring(0, 200) + "...",
              },
            },
          ],
        },
        { status: 500 },
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
