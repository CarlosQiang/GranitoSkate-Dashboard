import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario tiene permisos de administrador
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "No tienes permisos para acceder a esta información" },
        { status: 403 },
      )
    }

    // Obtener configuración de Shopify
    const config = {
      domain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "",
      accessToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
      apiUrl: process.env.SHOPIFY_API_URL || "",
    }

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    console.error("Error al verificar configuración de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
