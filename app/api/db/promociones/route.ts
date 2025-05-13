import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as promocionesRepository from "@/lib/db/repositories/promociones-repository"
import * as registroRepository from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const promociones = await promocionesRepository.getAllPromociones()
    return NextResponse.json(promociones)
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validar datos
    if (!data.titulo || !data.tipo) {
      return NextResponse.json({ error: "El título y tipo son obligatorios" }, { status: 400 })
    }

    // Crear promoción
    const promocion = await promocionesRepository.createPromocion(data)

    // Registrar evento
    await registroRepository.logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: promocion[0].id.toString(),
      accion: "CREATE",
      resultado: "SUCCESS",
      mensaje: `Promoción creada: ${data.titulo}`,
    })

    return NextResponse.json(promocion[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear promoción:", error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "PROMOTION",
      accion: "CREATE",
      resultado: "ERROR",
      mensaje: `Error al crear promoción: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 })
  }
}
