import { NextResponse } from "next/server"
import { defaultThemeConfig } from "@/types/theme-config"

// Esta es una implementación simple que guarda el tema en memoria
// En una aplicación real, guardaríamos esto en una base de datos
let savedTheme = { ...defaultThemeConfig }

export async function GET() {
  return NextResponse.json({ themeConfig: savedTheme })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.themeConfig) {
      return NextResponse.json({ error: "No se proporcionó la configuración del tema" }, { status: 400 })
    }

    // Validar y fusionar con los valores predeterminados para asegurarnos de que todos los campos estén presentes
    savedTheme = {
      ...defaultThemeConfig,
      ...body.themeConfig,
    }

    return NextResponse.json({ success: true, themeConfig: savedTheme })
  } catch (error) {
    console.error("Error al guardar el tema:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
