import { NextResponse } from "next/server"
import { obtenerOCrearColeccionTutoriales, sincronizarTodosTutorialesConShopify } from "@/lib/api/tutoriales"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Primero verificamos que la colección exista
    try {
      console.log("Verificando colección de tutoriales...")
      const coleccionId = await obtenerOCrearColeccionTutoriales()
      console.log("Colección de tutoriales verificada:", coleccionId)
    } catch (error) {
      console.error("Error al verificar colección de tutoriales:", error)
      return NextResponse.json(
        {
          success: false,
          message: `No se pudo verificar la colección de tutoriales: ${error instanceof Error ? error.message : "Error desconocido"}`,
          error,
        },
        { status: 500 },
      )
    }

    // Si la colección existe o se creó correctamente, procedemos con la sincronización
    console.log("Sincronizando todos los tutoriales...")
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
