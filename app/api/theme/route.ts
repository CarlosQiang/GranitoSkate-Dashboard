import { type NextRequest, NextResponse } from "next/server"
import { getThemeConfig, saveThemeConfig } from "@/lib/db/repositories/theme-repository"
import type { ThemeConfig } from "@/types/theme-config"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // En una implementación real, obtendríamos el shopId de la sesión o de un parámetro
    const shopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "default-shop"

    const themeConfig = await getThemeConfig(shopId)

    return NextResponse.json({ themeConfig })
  } catch (error) {
    console.error("Error al obtener la configuración del tema:", error)
    return NextResponse.json({ error: "Error al obtener la configuración del tema" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { themeConfig } = body as { themeConfig: ThemeConfig }

    if (!themeConfig) {
      return NextResponse.json({ error: "La configuración del tema es requerida" }, { status: 400 })
    }

    // En una implementación real, obtendríamos el shopId de la sesión o de un parámetro
    const shopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "default-shop"

    const success = await saveThemeConfig(shopId, themeConfig)

    if (success) {
      return NextResponse.json({ success: true, message: "Configuración guardada correctamente" })
    } else {
      return NextResponse.json({ error: "Error al guardar la configuración del tema" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al guardar la configuración del tema:", error)
    return NextResponse.json({ error: "Error al guardar la configuración del tema" }, { status: 500 })
  }
}
