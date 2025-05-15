import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get("endpoint")

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint no especificado" }, { status: 400 })
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyDomain || !shopifyToken) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    const url = `https://${shopifyDomain}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": shopifyToken,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Error en la respuesta de Shopify REST:", data)
      return NextResponse.json({ error: "Error en la petición a Shopify", details: data }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la petición REST a Shopify:", error)
    return NextResponse.json({ error: "Error al procesar la petición", message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get("endpoint")

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint no especificado" }, { status: 400 })
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyDomain || !shopifyToken) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    const body = await request.json()
    const url = `https://${shopifyDomain}${endpoint}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": shopifyToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Error en la respuesta de Shopify REST:", data)
      return NextResponse.json({ error: "Error en la petición a Shopify", details: data }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la petición REST a Shopify:", error)
    return NextResponse.json({ error: "Error al procesar la petición", message: error.message }, { status: 500 })
  }
}
