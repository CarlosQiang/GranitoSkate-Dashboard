import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { obtenerConfiguracionTienda, guardarConfiguracionTienda } from "@/lib/db/repositories/seo-repository"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const config = await obtenerConfiguracionTienda()

    return NextResponse.json({
      success: true,
      data: config,
    })
  } catch (error) {
    console.error("Error al obtener configuración de la tienda:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    const success = await guardarConfiguracionTienda(body)

    if (!success) {
      return NextResponse.json({ error: "Error al guardar configuración de la tienda" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Configuración de la tienda guardada correctamente",
    })
  } catch (error) {
    console.error("Error al guardar configuración de la tienda:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
