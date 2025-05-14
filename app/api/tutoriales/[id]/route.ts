import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { tutoriales } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const result = await db.select().from(tutoriales).where(eq(tutoriales.id, id)).limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ tutorial: result[0] })
  } catch (error) {
    console.error("Error al obtener tutorial:", error)
    return NextResponse.json(
      {
        error: "Error al obtener tutorial",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
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
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await req.json()

    // Verificar si el tutorial existe
    const existingTutorial = await db.select().from(tutoriales).where(eq(tutoriales.id, id)).limit(1)

    if (existingTutorial.length === 0) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    // Actualizar tutorial
    const [result] = await db
      .update(tutoriales)
      .set({
        titulo: body.titulo !== undefined ? body.titulo : existingTutorial[0].titulo,
        descripcion: body.descripcion !== undefined ? body.descripcion : existingTutorial[0].descripcion,
        contenido: body.contenido !== undefined ? body.contenido : existingTutorial[0].contenido,
        imagen_url: body.imagen_url !== undefined ? body.imagen_url : existingTutorial[0].imagen_url,
        autor_id: body.autor_id !== undefined ? body.autor_id : existingTutorial[0].autor_id,
        publicado: body.publicado !== undefined ? body.publicado : existingTutorial[0].publicado,
        destacado: body.destacado !== undefined ? body.destacado : existingTutorial[0].destacado,
        ultima_actualizacion: new Date(),
      })
      .where(eq(tutoriales.id, id))
      .returning()

    return NextResponse.json({ success: true, tutorial: result })
  } catch (error) {
    console.error("Error al actualizar tutorial:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar tutorial",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
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
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar si el tutorial existe
    const existingTutorial = await db.select().from(tutoriales).where(eq(tutoriales.id, id)).limit(1)

    if (existingTutorial.length === 0) {
      return NextResponse.json({ error: "Tutorial no encontrado" }, { status: 404 })
    }

    // Eliminar tutorial
    await db.delete(tutoriales).where(eq(tutoriales.id, id))

    return NextResponse.json({ success: true, message: "Tutorial eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar tutorial:", error)
    return NextResponse.json(
      {
        error: "Error al eliminar tutorial",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
