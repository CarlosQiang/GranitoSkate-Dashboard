import { NextResponse } from "next/server"
import { sincronizarTutorialesBidireccional } from "@/lib/sync-tutoriales"
import { verificarColeccionTutoriales } from "@/lib/shopify-init"

export async function GET() {
  try {
    // Primero verificamos que la colección exista
    const coleccionResult = await verificarColeccionTutoriales()

    if (!coleccionResult.success) {
      console.error("Error al verificar colección de tutoriales:", coleccionResult.message)
      return NextResponse.json(
        {
          success: false,
          message: `No se pudo verificar la colección de tutoriales: ${coleccionResult.message}`,
        },
        { status: 500 },
      )
    }

    // Si la colección existe o se creó correctamente, procedemos con la sincronización
    const resultado = await sincronizarTutorialesBidireccional()

    if (!resultado.success) {
      return NextResponse.json(
        {
          success: false,
          message: resultado.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en la sincronización de tutoriales:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido en la sincronización",
      },
      { status: 500 },
    )
  }
}
