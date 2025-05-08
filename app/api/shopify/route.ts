import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      shop: "Demo Shop",
      message: "Funcionalidad temporalmente deshabilitada",
    })
  } catch (error) {
    console.error("Error checking Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar Shopify",
      },
      { status: 500 },
    )
  }
}
