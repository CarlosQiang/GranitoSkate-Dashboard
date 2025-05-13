import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as tutorialesRepository from "@/lib/db/repositories/tutoriales-repository"
import * as registroRepository from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const tutoriales = await tutorialesRepository.getTutorialById(id)

    if (tutoriales.length === 0) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    return NextResponse.json(tutoriales[0])
  } catch (error) {
    console.error(`Error al obtener tutorial ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener tutorial" }, { status: 500 })
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
    if (!data.titulo || !data.contenido) {
      return NextResponse.json({ error: "El título y contenido son obligatorios" }, { status: 400 })
    }

    // Verificar que el tutorial existe
    const tutoriales = await tutorialesRepository.getTutorialById(id)
    if (tutoriales.length === 0) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    // Actualizar tutorial
    const tutorialActualizado = await tutorialesRepository.updateTutorial(id, data)

    // Registrar evento
    await registroRepository.logSyncEvent({
      tipo_entidad: "TUTORIAL",
      entidad_id: id.toString(),
      accion: "UPDATE",
      resultado: "SUCCESS",
      mensaje: `Tutorial actualizado: ${data.titulo}`,
    })

    return NextResponse.json(tutorialActualizado[0])
  } catch (error) {
    console.error(`Error al actualizar tutorial ${params.id}:`, error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "TUTORIAL",
      entidad_id: params.id,
      accion: "UPDATE",
      resultado: "ERROR",
      mensaje: `Error al actualizar tutorial: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al actualizar tutorial" }, { status: 500 })
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

    // Verificar que el tutorial existe
    const tutoriales = await tutorialesRepository.getTutorialById(id)
    if (tutoriales.length === 0) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    // Eliminar tutorial
    await tutorialesRepository.deleteTutorial(id)

    // Registrar evento
    await registroRepository.logSyncEvent({
      tipo_entidad: "TUTORIAL",
      entidad_id: id.toString(),
      accion: "DELETE",
      resultado: "SUCCESS",
      mensaje: `Tutorial eliminado: ${tutoriales[0].titulo}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al eliminar tutorial ${params.id}:`, error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "TUTORIAL",
      entidad_id: params.id,
      accion: "DELETE",
      resultado: "ERROR",
      mensaje: `Error al eliminar tutorial: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al eliminar tutorial" }, { status: 500 })
  }
}
