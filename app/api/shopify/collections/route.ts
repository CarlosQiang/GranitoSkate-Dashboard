import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchCollections, createCollection } from "@/lib/api/collections"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const collections = await fetchCollections()
    return NextResponse.json(collections)
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return NextResponse.json({ error: `Error al obtener colecciones: ${(error as Error).message}` }, { status: 500 })
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
    const result = await createCollection(data)

    return NextResponse.json({
      success: true,
      collection: result,
    })
  } catch (error) {
    console.error("Error al crear colección:", error)
    return NextResponse.json({ error: `Error al crear colección: ${(error as Error).message}` }, { status: 500 })
  }
}
