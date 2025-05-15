import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { orderId } = params

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyDomain || !shopifyToken) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify" }, { status: 500 })
    }

    // Construir la URL para la API REST de Shopify
    const url = `https://${shopifyDomain}/admin/api/2023-10/orders/${orderId}/close.json`

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyToken,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error en la respuesta de Shopify:", errorData)
      return NextResponse.json({ error: "Error al cerrar el pedido", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al cerrar el pedido:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud", message: error.message }, { status: 500 })
  }
}
