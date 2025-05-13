import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { crearTutorial, getTutoriales } from "@/lib/api/tutoriales"

export async function GET(req: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const searchParams = req.nextUrl.searchParams
    const publicadosOnly = searchParams.get("publicados") === "true"
    const destacados = searchParams.get("destacados") === "true"
    const categoria = searchParams.get("categoria") || undefined
    const busqueda = searchParams.get("busqueda") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Obtener tutoriales
    const result = await getTutoriales({
      publicadosOnly,
      destacados,
      categoria,
      busqueda,
      page,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener tutoriales:", error)
    return NextResponse.json({ error: "Error al obtener tutoriales" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del tutorial
    const data = await req.json()

    // Validar datos
    if (!data.titulo || !data.slug || !data.descripcion || !data.contenido) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Crear tutorial
    const tutorial = await crearTutorial(data)

    return NextResponse.json(tutorial, { status: 201 })
  } catch (error) {
    console.error("Error al crear tutorial:", error)
    return NextResponse.json({ error: "Error al crear tutorial" }, { status: 500 })
  }
}
