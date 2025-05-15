import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as syncService from "@/lib/sync/sync-service"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Redirigir a POST
    return NextResponse.json(
      {
        success: false,
        message: "Por favor, usa el método POST para sincronizar productos",
      },
      { status: 405 },
    )
  } catch (error) {
    console.error("Error en la sincronización:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en la sincronización",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos de la solicitud
    let limit = 50
    try {
      const data = await request.json()
      if (data && typeof data.limit === "number") {
        limit = data.limit
      }
    } catch (e) {
      // Si no hay cuerpo JSON o hay un error al parsearlo, usar el valor predeterminado
    }

    console.log(`Sincronizando productos con límite: ${limit}`)

    // Sincronizar productos
    const result = await syncService.syncProducts(limit)

    return NextResponse.json({
      success: true,
      message: "Sincronización de productos completada",
      result,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en la sincronización de productos",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
