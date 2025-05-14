import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { registro_sincronizacion } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
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
    const tipo = url.searchParams.get("tipo")
    const estado = url.searchParams.get("estado")

    let query = db.select().from(registro_sincronizacion).orderBy(desc(registro_sincronizacion.fecha))

    if (tipo) {
      query = query.where(eq(registro_sincronizacion.tipo, tipo))
    }

    if (estado) {
      query = query.where(eq(registro_sincronizacion.estado, estado))
    }

    const registros = await query.limit(limit).offset(offset)
    const totalQuery = db.select({ count: db.fn.count() }).from(registro_sincronizacion)

    if (tipo) {
      totalQuery.where(eq(registro_sincronizacion.tipo, tipo))
    }

    if (estado) {
      totalQuery.where(eq(registro_sincronizacion.estado, estado))
    }

    const [totalResult] = await totalQuery
    const total = Number(totalResult?.count || 0)

    return NextResponse.json({
      registros,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener registros de sincronización:", error)
    return NextResponse.json(
      {
        error: "Error al obtener registros",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
