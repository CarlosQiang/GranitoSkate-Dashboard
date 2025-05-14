import { NextResponse } from "next/server"
import db from "@/lib/db/vercel-postgres"

export async function GET() {
  try {
    const tutoriales = await db.findAll("tutoriales")
    return NextResponse.json(tutoriales)
  } catch (error) {
    console.error("Error al obtener tutoriales:", error)
    return NextResponse.json({ error: "Error al obtener tutoriales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar datos mínimos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    // Generar slug si no existe
    if (!data.slug) {
      data.slug = data.titulo
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
    }

    // Añadir fechas
    data.fecha_creacion = new Date()
    data.fecha_actualizacion = new Date()

    const tutorial = await db.insert("tutoriales", data)

    // Registrar evento
    await db.logSyncEvent(
      "TUTORIAL",
      tutorial.id.toString(),
      "CREATE",
      "SUCCESS",
      `Tutorial creado: ${tutorial.titulo}`,
      { tutorial },
    )

    return NextResponse.json(tutorial, { status: 201 })
  } catch (error) {
    console.error("Error al crear tutorial:", error)

    // Registrar error
    await db.logSyncEvent(
      "TUTORIAL",
      "UNKNOWN",
      "CREATE",
      "ERROR",
      `Error al crear tutorial: ${(error as Error).message}`,
      { error: (error as Error).message },
    )

    return NextResponse.json({ error: "Error al crear tutorial" }, { status: 500 })
  }
}
