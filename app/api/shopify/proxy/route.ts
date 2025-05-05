import { NextResponse } from "next/server"
import { GraphQLClient } from "graphql-request"

// Aumentar el tiempo de timeout para la solicitud
export const maxDuration = 30 // 30 segundos

export async function POST(request: Request) {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Variables de entorno de Shopify no definidas", {
        NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "defined" : "undefined",
        SHOPIFY_ACCESS_TOKEN: accessToken ? "defined" : "undefined",
      })

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

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`

    // Crear un cliente GraphQL para Shopify
    const client = new GraphQLClient(shopifyApiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      timeout: 25000, // 25 segundos de timeout
    })

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { query, variables } = body

    // Realizar la consulta a Shopify
    const data = await client.request(query, variables)

    // Devolver la respuesta
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)

    // Extraer mensaje de error más detallado
    let errorMessage = "Error desconocido al conectar con Shopify"
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // Detectar errores comunes y dar mensajes más útiles
      if (errorMessage.includes("401")) {
        errorMessage = "Error de autenticación: Verifica tu SHOPIFY_ACCESS_TOKEN"
        statusCode = 401
      } else if (errorMessage.includes("404")) {
        errorMessage = "Error 404: Verifica tu NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN"
        statusCode = 404
      } else if (errorMessage.includes("429")) {
        errorMessage = "Error 429: Has excedido el límite de solicitudes a la API"
        statusCode = 429
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Timeout: La solicitud a Shopify ha tardado demasiado tiempo"
        statusCode = 504
      }
    }

    return NextResponse.json(
      {
        errors: [
          {
            message: errorMessage,
          },
        ],
      },
      { status: statusCode },
    )
  }
}

// También permitimos GET para verificar la conexión
export async function GET() {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Variables de entorno de Shopify no definidas. Verifica NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
        },
        { status: 200 },
      )
    }

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`

    // Crear un cliente GraphQL para Shopify
    const client = new GraphQLClient(shopifyApiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 segundos de timeout
    })

    // Consulta simple para verificar la conexión
    const query = `
      {
        shop {
          name
          url
        }
      }
    `

    const data = await client.request(query)

    return NextResponse.json({
      success: true,
      shopName: data?.shop?.name || "Tienda Shopify",
      shopUrl: data?.shop?.url,
      message: "Conexión establecida correctamente",
    })
  } catch (error) {
    console.error("Error de conexión con Shopify:", error)

    // Extraer mensaje de error más detallado
    let errorMessage = "Error desconocido al conectar con Shopify"

    if (error instanceof Error) {
      errorMessage = error.message

      // Detectar errores comunes y dar mensajes más útiles
      if (errorMessage.includes("401")) {
        errorMessage = "Error de autenticación: Verifica tu SHOPIFY_ACCESS_TOKEN"
      } else if (errorMessage.includes("404")) {
        errorMessage = "Error 404: Verifica tu NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN"
      } else if (errorMessage.includes("429")) {
        errorMessage = "Error 429: Has excedido el límite de solicitudes a la API"
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Timeout: La solicitud a Shopify ha tardado demasiado tiempo"
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
    )
  }
}
