import { NextResponse } from "next/server"
import { getThemeConfig, saveThemeConfig, createThemeTablesIfNotExist } from "@/lib/db/repositories/theme-repository"
import { defaultThemeConfig } from "@/types/theme-config"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Función auxiliar para obtener el shopId
async function getShopId() {
  // En una aplicación real, esto vendría de la sesión del usuario o de un parámetro
  // Por ahora, usamos un valor predeterminado
  const session = await getServerSession(authOptions)
  return session?.user?.email || "default-shop"
}

export async function GET() {
  try {
    // Asegurarse de que las tablas existen
    await createThemeTablesIfNotExist()

    const shopId = await getShopId()
    const themeConfig = await getThemeConfig(shopId)

    return NextResponse.json({ themeConfig })
  } catch (error) {
    console.error("Error al obtener la configuración del tema:", error)
    return NextResponse.json({ error: "Error al obtener la configuración del tema" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const shopId = await getShopId()

    // Asegurarse de que las tablas existen
    await createThemeTablesIfNotExist()

    if (!body.themeConfig) {
      return NextResponse.json({ error: "No se proporcionó la configuración del tema" }, { status: 400 })
    }

    // Validar y fusionar con los valores predeterminados para asegurarnos de que todos los campos estén presentes
    const themeConfig = {
      ...defaultThemeConfig,
      ...body.themeConfig,
    }

    const success = await saveThemeConfig(shopId, themeConfig)

    if (success) {
      return NextResponse.json({ success: true, themeConfig })
    } else {
      return NextResponse.json({ error: "Error al guardar la configuración del tema" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al guardar el tema:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
