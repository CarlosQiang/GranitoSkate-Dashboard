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

    // Verificar variables de entorno relacionadas con Shopify
    const vars = {
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
      SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
      SHOPIFY_API_URL: !!process.env.SHOPIFY_API_URL,
      SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,
      NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN: !!process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN,

      // Variables de entorno relacionadas con la base de datos
      POSTGRES_URL: !!process.env.POSTGRES_URL,

      // Variables de entorno relacionadas con NextAuth
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,

      // Otras variables de entorno
      NEXT_PUBLIC_VERCEL_URL: !!process.env.NEXT_PUBLIC_VERCEL_URL,
      NEXT_PUBLIC_API_URL: !!process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_REGION: !!process.env.VERCEL_REGION,
    }

    return NextResponse.json({
      success: true,
      vars,
    })
  } catch (error) {
    console.error("Error al verificar variables de entorno:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
