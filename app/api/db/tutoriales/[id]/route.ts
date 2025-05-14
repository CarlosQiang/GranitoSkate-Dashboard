import { NextResponse } from "next/server"
import { getTutorialById, updateTutorial, deleteTutorial } from "@/lib/db/repositories/tutoriales-repository"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const tutorial = await getTutorialById(id)

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
    const data = await request.json()
    const tutorial = await updateTutorial(id, data)

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error(`Error al actualizar tutorial ${params.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar tutorial" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await deleteTutorial(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al eliminar tutorial ${params.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar tutorial" }, { status: 500 })
  }
}
