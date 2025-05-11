import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Aumentar el tiempo de timeout para la solicitud
export const maxDuration = 60 // 60 segundos

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error("Check: No autorizado - Sesión no encontrada")
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    console.log("Check: Verificando conexión con Shopify...")

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain) {
      console.error("Check: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return NextResponse.json({ success: false, error: "Falta el dominio de la tienda Shopify" }, { status: 200 })
    }

    if (!accessToken) {
      console.error("Check: SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json({ success: false, error: "Falta el token de acceso de Shopify" }, { status: 200 })
    }

    // Hacer la solicitud a la API de Shopify
    const apiVersion = "2023-07"
    const shopifyUrl = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`

    console.log(`Check: URL de Shopify: ${shopifyUrl}`)

    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `
          {
            shop {
              name
              url
              primaryDomain {
                url
              }
            }
          }
        `,
      }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Check: Error en la respuesta de Shopify (${response.status}): ${errorText}`)
      return NextResponse.json(
        {
          success: false,
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: 200 },
      )
    }

    // Intentar parsear la respuesta JSON
    let data
    try {
      data = await response.json()
    } catch (error) {
      console.error("Check: Error al parsear la respuesta JSON:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Error al parsear la respuesta JSON de Shopify",
        },
        { status: 200 },
      )
    }

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      console.error("Check: Errores GraphQL:", JSON.stringify(data.errors, null, 2))
      return NextResponse.json(
        {
          success: false,
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 200 },
      )
    }

    console.log("Check: Conexión con Shopify establecida correctamente:", data)

    return NextResponse.json({
      success: true,
      shopName: data?.data?.shop?.name || "Tienda Shopify",
      shopUrl: data?.data?.shop?.primaryDomain?.url || data?.data?.shop?.url,
      message: "Conexión establecida correctamente",
    })
  } catch (error) {
    console.error("Check: Error de conexión con Shopify:", error)

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
      { status: 200 },
    )
  }
}

// También permitimos POST para mantener compatibilidad con código existente
export async function POST() {
  return GET(new Request("https://example.com"))
}
