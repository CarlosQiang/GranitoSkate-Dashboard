import { type NextRequest, NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/api/shopify"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = url.searchParams.get("limit") || "50"
    const page = url.searchParams.get("page") || "1"

    const response = await shopifyFetch({
      endpoint: `custom_collections.json?limit=${limit}&page=${page}`,
      method: "GET",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error al obtener colecciones: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en API de colecciones:", error)
    return NextResponse.json(
      {
        error: "Error al obtener colecciones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const response = await shopifyFetch({
      endpoint: "custom_collections.json",
      method: "POST",
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error al crear colección: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al crear colección:", error)
    return NextResponse.json(
      {
        error: "Error al crear colección",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
