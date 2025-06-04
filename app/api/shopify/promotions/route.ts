import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { obtenerPromociones } from "@/lib/api/promociones"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener promociones de Shopify
    const promociones = await obtenerPromociones()

    return NextResponse.json(promociones)
  } catch (error) {
    console.error("Error al obtener promociones de Shopify:", error)
    return NextResponse.json(
      { error: `Error al obtener promociones: ${error instanceof Error ? error.message : "Error desconocido"}` },
      { status: 500 },
    )
  }
}
