import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { shopifyFetch } from "@/lib/shopify-client"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const variables = searchParams.get("variables")

    if (!query) {
      return NextResponse.json({ error: "Se requiere una consulta GraphQL" }, { status: 400 })
    }

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({
      query,
      variables: variables ? JSON.parse(variables) : {},
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error en la API de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido en la API de Shopify",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()
    const { query, variables } = body

    if (!query) {
      return NextResponse.json({ error: "Se requiere una consulta GraphQL" }, { status: 400 })
    }

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({
      query,
      variables: variables || {},
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error en la API de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido en la API de Shopify",
      },
      { status: 500 },
    )
  }
}
