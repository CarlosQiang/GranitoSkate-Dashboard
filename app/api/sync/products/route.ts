import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAllProducts } from "@/lib/services/product-sync-service"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const limit = 50 // Valor predeterminado para GET
    const result = await syncAllProducts(limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json({ error: `Error al sincronizar productos: ${(error as Error).message}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la solicitud
    const body = await request.json().catch(() => ({}))
    const limit = body.limit || 250

    // Iniciar sincronización
    const result = await syncAllProducts(limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json({ error: `Error al sincronizar productos: ${(error as Error).message}` }, { status: 500 })
  }
}
