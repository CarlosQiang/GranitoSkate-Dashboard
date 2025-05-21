import { NextResponse } from "next/server"
import { createThemeTablesIfNotExist } from "@/lib/db/repositories/theme-repository"

export async function GET() {
  try {
    const success = await createThemeTablesIfNotExist()

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Tablas de tema creadas o verificadas correctamente",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al crear las tablas de tema",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al inicializar las tablas de tema:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al inicializar las tablas de tema",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
