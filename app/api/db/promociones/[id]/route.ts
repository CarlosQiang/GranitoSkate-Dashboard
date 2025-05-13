import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as promocionesRepository from "@/lib/db/repositories/promociones-repository"
import * as registroRepository from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const promociones = await promocionesRepository.getPromocionById(id)

    if (promociones.length === 0) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    return NextResponse.json(promociones[0])
  } catch (error) {
    console.error(`Error al obtener promoción ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener promoción" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const data = await request.json()

    // Validar datos
    if (!data.titulo || !data.tipo) {
      return NextResponse.json({ error: "El título y tipo son obligatorios" }, { status: 400 })
    }

    // Verificar que la promoción existe
    const promociones = await promocionesRepository.getPromocionById(id)
    if (promociones.length === 0) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    // Actualizar promoción
    const promocionActualizada = await promocionesRepository.updatePromocion(id, data)

    // Registrar evento
    await registroRepository.logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: id.toString(),
      accion: "UPDATE",
      resultado: "SUCCESS",
      mensaje: `Promoción actualizada: ${data.titulo}`,
    })

    return NextResponse.json(promocionActualizada[0])
  } catch (error) {
    console.error(`Error al actualizar promoción ${params.id}:`, error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: params.id,
      accion: "UPDATE",
      resultado: "ERROR",
      mensaje: `Error al actualizar promoción: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al actualizar promoción" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    // Verificar que la promoción existe
    const promociones = await promocionesRepository.getPromocionById(id)
    if (promociones.length === 0) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    // Eliminar promoción
    await promocionesRepository.deletePromocion(id)

    // Registrar evento
    await registroRepository.logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: id.toString(),
      accion: "DELETE",
      resultado: "SUCCESS",
      mensaje: `Promoción eliminada: ${promociones[0].titulo}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al eliminar promoción ${params.id}:`, error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: params.id,
      accion: "DELETE",
      resultado: "ERROR",
      mensaje: `Error al eliminar promoción: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 })
  }
}
