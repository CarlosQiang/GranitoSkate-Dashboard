import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      collections: [],
      message: "Funcionalidad temporalmente deshabilitada",
    })
  } catch (error) {
    console.error("Error checking collections:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar colecciones",
      },
      { status: 500 },
    )
  }
}
