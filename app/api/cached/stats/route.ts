import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCacheStats, clearCache } from "@/lib/services/shopify-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener estadísticas de la caché
    const stats = getCacheStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error: any) {
    console.error("Error al obtener estadísticas de caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener estadísticas de caché",
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Limpiar la caché
    clearCache()

    return NextResponse.json({
      success: true,
      message: "Caché limpiada correctamente",
    })
  } catch (error: any) {
    console.error("Error al limpiar caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al limpiar caché",
      },
      { status: 500 },
    )
  }
}
