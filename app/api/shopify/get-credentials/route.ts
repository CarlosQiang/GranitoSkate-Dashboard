import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Verificar que el usuario tenga permisos de administrador
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para realizar esta acción" },
        { status: 403 },
      )
    }

    // Obtener las variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
    const hasAccessToken = !!process.env.SHOPIFY_ACCESS_TOKEN

    return NextResponse.json({
      success: true,
      shopDomain,
      hasAccessToken,
    })
  } catch (error) {
    console.error("Error al obtener las credenciales de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
