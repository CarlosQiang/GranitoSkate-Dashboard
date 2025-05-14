import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { registro_sincronizacion } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const [result] = await db.select({ count: db.fn.count() }).from(registro_sincronizacion)
    const count = Number(result?.count || 0)

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error al contar registros de sincronización:", error)
    return NextResponse.json(
      {
        error: "Error al contar registros",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
