import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { tutoriales } from "@/lib/db/schema"
import { desc, asc, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const offset = (page - 1) * limit
    const sort = url.searchParams.get("sort") || "id"
    const order = url.searchParams.get("order") || "desc"
    const destacados = url.searchParams.get("destacados") === "true"

    let query = db.select().from(tutoriales)

    if (destacados) {
      query = query.where(eq(tutoriales.destacado, true))
    }

    // Aplicar ordenamiento
    if (order === "desc") {
      query = query.orderBy(desc(tutoriales[sort as keyof typeof tutoriales]))
    } else {
      query = query.orderBy(asc(tutoriales[sort as keyof typeof tutoriales]))
    }

    const tutorialesResult = await query.limit(limit).offset(offset)
    const [totalResult] = await db.select({ count: db.fn.count() }).from(tutoriales)
    const total = Number(totalResult?.count || 0)

    return NextResponse.json({
      tutoriales: tutorialesResult,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener tutoriales:", error)
    return NextResponse.json(
      {
        error: "Error al obtener tutoriales",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Validar datos
    if (!body.titulo || !body.contenido) {
      return NextResponse.json({ error: "Faltan campos obligatorios: titulo, contenido" }, { status: 400 })
    }

    // Insertar tutorial
    const [result] = await db
      .insert(tutoriales)
      .values({
        titulo: body.titulo,
        descripcion: body.descripcion || "",
        contenido: body.contenido,
        imagen_url: body.imagen_url || "",
        autor_id: body.autor_id || null,
        publicado: body.publicado !== undefined ? body.publicado : false,
        destacado: body.destacado !== undefined ? body.destacado : false,
        fecha_creacion: new Date(),
        ultima_actualizacion: new Date(),
      })
      .returning()

    return NextResponse.json({ success: true, tutorial: result })
  } catch (error) {
    console.error("Error al crear tutorial:", error)
    return NextResponse.json(
      {
        error: "Error al crear tutorial",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
