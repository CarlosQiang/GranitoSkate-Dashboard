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
    const usuarioId = searchParams.get("usuarioId")
    const accion = searchParams.get("accion")
    const entidad = searchParams.get("entidad")
    const resultado = searchParams.get("resultado")
    const limite = Number.parseInt(searchParams.get("limite") || "10")

    const filtros = {
      usuarioId: usuarioId ? Number.parseInt(usuarioId) : undefined,
      accion: accion || undefined,
      entidad: entidad || undefined,
      resultado: resultado || undefined,
      limite: Math.min(limite, 10), // Máximo 10 registros
    }

    const registros = await ActivityLogger.getRegistros(filtros)

    return NextResponse.json(registros)
  } catch (error) {
    console.error("Error al obtener registros:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
