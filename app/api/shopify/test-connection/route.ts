import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "shopify-test-connection",
})

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API de prueba de Shopify")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain) {
      logger.error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de Shopify incompleta: falta el dominio de la tienda",
        },
        { status: 500 },
      )
    }

    if (!accessToken) {
      logger.error("SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de Shopify incompleta: falta el token de acceso",
        },
        { status: 500 },
      )
    }

    // Consulta simple para verificar la conexión
    const query = `
      {
        shop {
          name
          id
          url
          primaryDomain {
            url
            host
          }
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
        }
      }
    `

    logger.debug("Enviando consulta de prueba a Shopify", {
      shopDomain,
      query,
    })

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Error en la respuesta de Shopify (${response.status})`, { errorText })

      return NextResponse.json(
        {
          success: false,
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Intentar parsear la respuesta JSON
    let data
    try {
      data = await response.json()
    } catch (error) {
      logger.error("Error al parsear la respuesta JSON", {
        error: error instanceof Error ? error.message : "Error desconocido",
      })

      return NextResponse.json(
        {
          success: false,
          error: "Error al parsear la respuesta JSON de Shopify",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 500 },
      )
    }

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      logger.error("Errores GraphQL", { errors: data.errors })

      return NextResponse.json(
        {
          success: false,
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexión con Shopify establecida correctamente",
      data: data.data,
    })
  } catch (error) {
    logger.error("Error en la prueba de conexión con Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
