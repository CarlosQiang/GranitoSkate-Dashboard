import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTutorialById, actualizarTutorial, eliminarTutorial } from "@/lib/api/tutoriales"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const tutorial = await getTutorialById(id)

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error("Error al obtener tutorial:", error)
    return NextResponse.json({ error: "Error al obtener tutorial" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const data = await req.json()

    // Actualizar tutorial
    const tutorial = await actualizarTutorial(id, data)

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error("Error al actualizar tutorial:", error)
    return NextResponse.json({ error: "Error al actualizar tutorial" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    await eliminarTutorial(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar tutorial:", error)
    return NextResponse.json({ error: "Error al eliminar tutorial" }, { status: 500 })
  }
}
