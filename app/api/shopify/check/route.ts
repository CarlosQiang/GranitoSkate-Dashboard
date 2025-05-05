import { NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"

// Aumentar el tiempo de timeout para la solicitud
export const maxDuration = 30 // 30 segundos

export async function GET(request: Request) {
  try {
    console.log("Verificando conexión con Shopify...")

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
          success: false,
          error:
            "Variables de entorno de Shopify no definidas. Verifica NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
        },
        { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
      )
    }

    // Obtener la URL de la solicitud para extraer parámetros
    const url = new URL(request.url)
    const retry = url.searchParams.get("retry") || "0"

    console.log(`Intento de conexión #${retry}`)

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

    const data = await shopifyClient.request(query)

    console.log("Conexión con Shopify establecida correctamente:", data)

    return NextResponse.json({
      success: true,
      shopName: data?.shop?.name || "Tienda Shopify",
      shopUrl: data?.shop?.primaryDomain?.url || data?.shop?.url,
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

// También permitimos POST para mantener compatibilidad con código existente
export async function POST() {
  return GET(new Request("https://example.com"))
}
