import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { colecciones } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const [result] = await db.select({ count: db.fn.count() }).from(colecciones)
    const count = Number(result?.count || 0)

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error al contar colecciones:", error)
    return NextResponse.json(
      {
        error: "Error al contar colecciones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
