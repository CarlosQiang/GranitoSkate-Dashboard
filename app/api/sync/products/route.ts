import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncProducts } from "@/lib/sync/sync-service"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const result = await syncProducts()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json({ error: `Error al sincronizar productos: ${(error as Error).message}` }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const result = await syncProducts()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json({ error: `Error al sincronizar productos: ${(error as Error).message}` }, { status: 500 })
  }
}
