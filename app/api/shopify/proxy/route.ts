import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const maxDuration = 60 // 60 segundos

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain) {
      console.error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return NextResponse.json(
        { error: "Configuración de Shopify incompleta: falta el dominio de la tienda" },
        { status: 500 },
      )
    }

    if (!accessToken) {
      console.error("SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json(
        { error: "Configuración de Shopify incompleta: falta el token de acceso" },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { query, variables } = body

    console.log("Enviando consulta a Shopify:", query.substring(0, 100) + "...")

    // Usar la versión 2023-07 de la API que es más compatible con las consultas actuales
    const apiVersion = "2023-07"

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables: variables || {},
      }),
      cache: "no-store",
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}): ${errorText}`)
      return NextResponse.json(
        {
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
      console.error("Error al parsear la respuesta JSON:", error)
      return NextResponse.json(
        {
          error: "Error al parsear la respuesta JSON de Shopify",
          details: (error as Error).message,
        },
        { status: 500 },
      )
    }

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      console.error("Errores GraphQL:", JSON.stringify(data.errors, null, 2))
      return NextResponse.json(
        {
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Añadir soporte para GET para el endpoint de verificación
export async function GET() {
  return NextResponse.json({ success: true, message: "Proxy de Shopify funcionando correctamente" })
}
