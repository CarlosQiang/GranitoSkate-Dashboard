import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ActivityLogger } from "@/lib/services/activity-logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fechaDesde = searchParams.get("fechaDesde")
    const fechaHasta = searchParams.get("fechaHasta")

    const estadisticas = await ActivityLogger.getEstadisticas(
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    )

    return NextResponse.json(estadisticas)
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
