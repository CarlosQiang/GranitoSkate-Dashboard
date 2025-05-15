import { NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar la conexión con Shopify
    const query = `
      query {
        shop {
          name
        }
      }
    `

    await shopifyClient.request(query)

    return NextResponse.json({ status: "ok", message: "Conexión con Shopify establecida correctamente" })
  } catch (error: any) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return NextResponse.json(
      { status: "error", message: `Error al conectar con Shopify: ${error.message}` },
      { status: 500 },
    )
  }
}
