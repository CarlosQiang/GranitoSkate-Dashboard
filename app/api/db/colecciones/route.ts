import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { colecciones } from "@/lib/db/schema"
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

    let query = db.select().from(colecciones)

    // Aplicar ordenamiento
    if (order === "desc") {
      query = query.orderBy(desc(colecciones[sort as keyof typeof colecciones]))
    } else {
      query = query.orderBy(asc(colecciones[sort as keyof typeof colecciones]))
    }

    const coleccionesResult = await query.limit(limit).offset(offset)
    const [totalResult] = await db.select({ count: db.fn.count() }).from(colecciones)
    const total = Number(totalResult?.count || 0)

    return NextResponse.json({
      colecciones: coleccionesResult,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return NextResponse.json(
      {
        error: "Error al obtener colecciones",
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
    if (!body.nombre || !body.shopify_id) {
      return NextResponse.json({ error: "Faltan campos obligatorios: nombre, shopify_id" }, { status: 400 })
    }

    // Verificar si ya existe una colección con el mismo shopify_id
    const existingCollection = await db
      .select()
      .from(colecciones)
      .where(eq(colecciones.shopify_id, body.shopify_id))
      .limit(1)

    if (existingCollection.length > 0) {
      return NextResponse.json({ error: "Ya existe una colección con el mismo shopify_id" }, { status: 409 })
    }

    // Insertar colección
    const [result] = await db
      .insert(colecciones)
      .values({
        nombre: body.nombre,
        descripcion: body.descripcion || "",
        shopify_id: body.shopify_id,
        imagen_url: body.imagen_url || "",
        activo: body.activo !== undefined ? body.activo : true,
        meta_titulo: body.meta_titulo || body.nombre,
        meta_descripcion: body.meta_descripcion || "",
        meta_keywords: body.meta_keywords || "",
        fecha_creacion: new Date(),
        ultima_actualizacion: new Date(),
      })
      .returning()

    return NextResponse.json({ success: true, coleccion: result })
  } catch (error) {
    console.error("Error al crear colección:", error)
    return NextResponse.json(
      {
        error: "Error al crear colección",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
