import { NextResponse } from "next/server"
import { getAllTutoriales, createTutorial } from "@/lib/db/repositories/tutoriales-repository"

export async function GET() {
  try {
    const tutoriales = await getAllTutoriales()
    return NextResponse.json(tutoriales)
  } catch (error) {
    console.error("Error al obtener tutoriales:", error)
    return NextResponse.json({ error: "Error al obtener tutoriales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const tutorial = await createTutorial(data)
    return NextResponse.json(tutorial, { status: 201 })
  } catch (error) {
    console.error("Error al crear tutorial:", error)
    return NextResponse.json({ error: "Error al crear tutorial" }, { status: 500 })
  }
}
