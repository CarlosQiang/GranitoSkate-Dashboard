import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as tutorialesRepository from "@/lib/db/repositories/tutoriales-repository"
import * as registroRepository from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const tutoriales = await tutorialesRepository.getAllTutoriales()
    return NextResponse.json(tutoriales)
  } catch (error) {
    console.error("Error al obtener tutoriales:", error)
    return NextResponse.json({ error: "Error al obtener tutoriales" }, { status: 500 })
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
    if (!data.titulo || !data.slug || !data.contenido) {
      return NextResponse.json({ error: "El título, slug y contenido son obligatorios" }, { status: 400 })
    }

    // Crear tutorial
    const tutorial = await tutorialesRepository.createTutorial(data)

    // Registrar evento
    await registroRepository.logSyncEvent({
      tipo_entidad: "TUTORIAL",
      entidad_id: tutorial[0].id.toString(),
      accion: "CREATE",
      resultado: "SUCCESS",
      mensaje: `Tutorial creado: ${data.titulo}`,
    })

    return NextResponse.json(tutorial[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear tutorial:", error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "TUTORIAL",
      accion: "CREATE",
      resultado: "ERROR",
      mensaje: `Error al crear tutorial: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al crear tutorial" }, { status: 500 })
  }
}
