import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
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
        {
          success: false,
          error: "Configuración de Shopify incompleta: falta el dominio de la tienda",
        },
        { status: 200 },
      )
    }

    if (!accessToken) {
      console.error("SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de Shopify incompleta: falta el token de acceso",
        },
        { status: 200 },
      )
    }

    // Consulta GraphQL simple para verificar la conexión
    const query = `
      {
        shop {
          name
        }
      }
    `

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
      console.error(`Error en la respuesta de Shopify (${response.status}): ${errorText}`)
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
      console.error("Error al parsear la respuesta JSON:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Error al parsear la respuesta JSON de Shopify",
          details: (error as Error).message,
        },
        { status: 200 },
      )
    }

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      console.error("Errores GraphQL:", data.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 200 },
      )
    }

    // Verificar que la respuesta contiene los datos esperados
    if (!data.data || !data.data.shop) {
      console.error("Respuesta de Shopify incompleta:", data)
      return NextResponse.json(
        {
          success: false,
          error: "Respuesta de Shopify incompleta o inesperada",
          details: data,
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      success: true,
      shopName: data.data.shop.name,
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al verificar la conexión: ${(error as Error).message}`,
      },
      { status: 200 },
    )
  }
}
