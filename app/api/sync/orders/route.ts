import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Simular sincronización de pedidos
    await new Promise((resolve) => setTimeout(resolve, 2200))

    return NextResponse.json({
      success: true,
      message: "Pedidos sincronizados correctamente",
      data: {
        synchronized: 15,
        errors: 0,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error syncing orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al sincronizar pedidos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
