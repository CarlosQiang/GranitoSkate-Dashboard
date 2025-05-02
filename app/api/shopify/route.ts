import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    // Hacer la solicitud a la API de Shopify
    const shopifyResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
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
      console.error(`Error en la respuesta de Shopify (${shopifyResponse.status}): ${errorText}`)
      return NextResponse.json(
        { error: `Error en la respuesta de Shopify: ${shopifyResponse.status}` },
        { status: shopifyResponse.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la API de Shopify:", error)
    return NextResponse.json({ error: `Error interno del servidor: ${(error as Error).message}` }, { status: 500 })
  }
}

// Añadir soporte para GET para el endpoint de verificación
export async function GET() {
  return NextResponse.json({ error: "Método no permitido. Use POST para consultas GraphQL." }, { status: 405 })
}
