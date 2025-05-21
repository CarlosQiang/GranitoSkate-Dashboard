import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener las credenciales de Shopify
    const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN } = process.env

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    // Obtener el cuerpo de la petición
    const body = await request.json()

    // Construir la URL de la API de Shopify
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/graphql.json`

    // Realizar la petición a Shopify
    const shopifyResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify(body),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const errorData = await shopifyResponse.json()
      console.error("Error en la respuesta de Shopify:", errorData)
      return NextResponse.json(
        { error: `Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`, details: errorData },
        { status: shopifyResponse.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json({ error: error.message || "Error desconocido en el proxy de Shopify" }, { status: 500 })
  }
}
