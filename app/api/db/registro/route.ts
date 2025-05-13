import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as registroRepository from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")
    const entidad = searchParams.get("entidad")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let eventos
    if (tipo) {
      eventos = await registroRepository.getSyncEventsByEntity(tipo, entidad || undefined, limit)
    } else {
      eventos = await registroRepository.getRecentSyncEvents(limit)
    }

    return NextResponse.json(eventos)
  } catch (error) {
    console.error("Error al obtener registro de sincronización:", error)
    return NextResponse.json({ error: "Error al obtener registro de sincronización" }, { status: 500 })
  }
}
