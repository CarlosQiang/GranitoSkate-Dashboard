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

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const entity = searchParams.get("entity")

    let result

    // Sincronizar entidad específica o todo
    if (entity === "products") {
      result = await syncService.syncProducts()
    } else if (entity === "collections") {
      result = await syncService.syncCollections()
    } else if (entity === "customers") {
      result = await syncService.syncCustomers()
    } else if (entity === "orders") {
      result = await syncService.syncOrders()
    } else if (entity === "promotions") {
      result = await syncService.syncPromotions()
    } else {
      // Sincronizar todo
      result = await syncService.syncAll()
    }

    return NextResponse.json({
      success: true,
      message: "Sincronización completada",
      result,
    })
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
    const data = await request.json()
    const { entity } = data

    let result

    // Sincronizar entidad específica o todo
    if (entity === "products") {
      result = await syncService.syncProducts()
    } else if (entity === "collections") {
      result = await syncService.syncCollections()
    } else if (entity === "customers") {
      result = await syncService.syncCustomers()
    } else if (entity === "orders") {
      result = await syncService.syncOrders()
    } else if (entity === "promotions") {
      result = await syncService.syncPromotions()
    } else {
      // Sincronizar todo
      result = await syncService.syncAll()
    }

    return NextResponse.json({
      success: true,
      message: "Sincronización completada",
      result,
    })
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
