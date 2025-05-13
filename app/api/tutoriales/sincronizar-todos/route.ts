import { NextResponse } from "next/server"
import { sincronizarTutorialesBidireccional } from "@/lib/sync-tutoriales"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Ejecutar sincronización bidireccional
    const resultado = await sincronizarTutorialesBidireccional()

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en la sincronización de tutoriales:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
