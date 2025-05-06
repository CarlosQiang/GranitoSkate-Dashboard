import { NextResponse } from "next/server"
import { checkShopifyEnvVars, getShopifyCredentials } from "@/lib/server-shopify"

// Aumentar el tiempo de timeout para la solicitud
export const maxDuration = 60 // 60 segundos

export async function POST(request: Request) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!checkShopifyEnvVars()) {
      return NextResponse.json(
        {
          errors: [
            {
              message: "Shopify environment variables not defined",
            },
          ],
        },
        { status: 500 },
      )
    }

    // Obtener las credenciales de Shopify
    const { shopDomain, accessToken } = getShopifyCredentials()

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

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

    // Obtener la respuesta de Shopify
    const data = await shopifyResponse.json()

    // Devolver la respuesta de Shopify
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Shopify proxy:", error)
    return NextResponse.json(
      {
        errors: [
          {
            message: error instanceof Error ? error.message : "Unknown error in Shopify proxy",
          },
        ],
      },
      { status: 500 },
    )
  }
}
