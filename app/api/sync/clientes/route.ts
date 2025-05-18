import { NextResponse } from "next/server"
import { sincronizarClientes } from "@/lib/services/sync-service"

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Obtener clientes reales de Shopify
    const clientes = await sincronizarClientes(limit)

    return NextResponse.json({
      success: true,
      message: `Se obtuvieron ${clientes.length} clientes de Shopify`,
      data: clientes,
    })
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
