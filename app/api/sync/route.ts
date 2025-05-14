import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAll } from "@/lib/sync/sync-service"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Iniciar sincronización
    const result = await syncAll()

    return NextResponse.json({
      success: true,
      message: "Sincronización completada con éxito",
      data: result,
    })
  } catch (error) {
    console.error("Error en la sincronización:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "API",
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error en la API de sincronización: ${(error as Error).message}`,
    })

    return NextResponse.json(
      {
        success: false,
        message: `Error en la sincronización: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
