import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCacheStats } from "@/lib/services/shopify-service"

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
    console.error("Error al obtener información de caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener información de caché",
      },
      { status: 500 },
    )
  }
}
