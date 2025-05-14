import { NextResponse } from "next/server"
import db from "@/lib/db/vercel-postgres"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const tutorial = await db.findById("tutoriales", id)

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error(`Error al obtener tutorial ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener tutorial" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await request.json()

    // Actualizar fecha
    data.fecha_actualizacion = new Date()

    const tutorial = await db.update("tutoriales", id, data)

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    // Registrar evento
    await db.logSyncEvent("TUTORIAL", id.toString(), "UPDATE", "SUCCESS", `Tutorial actualizado: ${tutorial.titulo}`, {
      tutorial,
    })

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error(`Error al actualizar tutorial ${params.id}:`, error)

    // Registrar error
    await db.logSyncEvent(
      "TUTORIAL",
      params.id,
      "UPDATE",
      "ERROR",
      `Error al actualizar tutorial: ${(error as Error).message}`,
      { error: (error as Error).message },
    )

    return NextResponse.json({ error: "Error al actualizar tutorial" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Obtener tutorial antes de eliminarlo
    const tutorial = await db.findById("tutoriales", id)

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    await db.remove("tutoriales", id)

    // Registrar evento
    await db.logSyncEvent("TUTORIAL", id.toString(), "DELETE", "SUCCESS", `Tutorial eliminado: ${tutorial.titulo}`, {
      tutorial,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al eliminar tutorial ${params.id}:`, error)

    // Registrar error
    await db.logSyncEvent(
      "TUTORIAL",
      params.id,
      "DELETE",
      "ERROR",
      `Error al eliminar tutorial: ${(error as Error).message}`,
      { error: (error as Error).message },
    )

    return NextResponse.json({ error: "Error al eliminar tutorial" }, { status: 500 })
  }
}
