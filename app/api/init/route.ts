import { NextResponse } from "next/server"
import { inicializarShopify } from "@/lib/shopify-init"

export async function GET() {
  try {
    // Inicializar todo lo relacionado con Shopify
    const resultado = await inicializarShopify()

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en la inicialización:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
