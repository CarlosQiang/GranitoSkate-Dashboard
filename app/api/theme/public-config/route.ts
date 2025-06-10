import { NextResponse } from "next/server"
import { getThemeConfig } from "@/lib/db/repositories/theme-repository"

export async function GET() {
  try {
    // Usar un shopId predeterminado para la configuración pública
    const shopId = "default-shop"

    const themeConfig = await getThemeConfig(shopId)

    return NextResponse.json({
      shopName: themeConfig.shopName,
      logoUrl: themeConfig.logoUrl,
      favicon: themeConfig.favicon,
    })
  } catch (error) {
    console.error("Error al obtener la configuración pública del tema:", error)
    return NextResponse.json({
      shopName: "Granito Management app",
      logoUrl: "/logo-granito-management.png",
      favicon: "/favicon-granito.ico",
    })
  }
}
