import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Lista de variables de entorno a verificar
    const requiredVariables = [
      "SHOPIFY_STORE_DOMAIN",
      "SHOPIFY_ACCESS_TOKEN",
      "SHOPIFY_API_URL",
      "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN",
      "POSTGRES_URL",
      "NEXTAUTH_URL",
      "NEXTAUTH_SECRET",
    ]

    // Verificar cada variable
    const variables: Record<string, { name: string; exists: boolean; value?: string }> = {}

    for (const varName of requiredVariables) {
      const exists = !!process.env[varName]
      variables[varName] = {
        name: varName,
        exists,
        // Solo incluir el valor para variables públicas o parciales para privadas
        value: varName.startsWith("NEXT_PUBLIC_")
          ? process.env[varName]
          : exists
            ? `${process.env[varName]?.substring(0, 3)}...${process.env[varName]?.substring(process.env[varName].length - 3)}`
            : undefined,
      }
    }

    return NextResponse.json({
      success: true,
      variables,
      allConfigured: Object.values(variables).every((v) => v.exists),
    })
  } catch (error: any) {
    console.error("Error al verificar variables de entorno:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al verificar variables de entorno",
      },
      { status: 500 },
    )
  }
}
