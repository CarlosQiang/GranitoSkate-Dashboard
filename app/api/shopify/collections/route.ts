import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const shopifyUrl = process.env.SHOPIFY_STORE_URL
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyUrl || !accessToken) {
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    const response = await fetch(`${shopifyUrl}/admin/api/2023-10/collections.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error de Shopify: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      collections: data.collections || [],
    })
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener colecciones",
        collections: [],
      },
      { status: 500 },
    )
  }
}
