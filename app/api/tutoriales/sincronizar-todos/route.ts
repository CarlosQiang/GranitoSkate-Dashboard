import { NextResponse } from "next/server"
import { sincronizarTodosTutorialesConShopify } from "@/lib/api/tutoriales"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    console.log("Iniciando sincronización de tutoriales desde API...")

    // Ejecutar sincronización
    const resultado = await sincronizarTodosTutorialesConShopify()

    console.log("Resultado de sincronización:", resultado)

    if (!resultado.success) {
      return NextResponse.json(
        {
          success: false,
          message: resultado.message,
          error: resultado.error,
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
        error,
      },
      { status: 500 },
    )
  }
}
