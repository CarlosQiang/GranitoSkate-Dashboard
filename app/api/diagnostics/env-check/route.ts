import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Lista de variables de entorno a verificar
    const envVars = [
      "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN",
      "SHOPIFY_ACCESS_TOKEN",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "ADMIN_EMAIL",
      "ADMIN_PASSWORD",
    ]

    // Verificar cada variable
    const variables: Record<string, boolean> = {}

    envVars.forEach((varName) => {
      const value = process.env[varName]
      variables[varName] = !!value && value.trim() !== ""
    })

    // Verificar si todas las variables requeridas están definidas
    const requiredVars = ["NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN", "SHOPIFY_ACCESS_TOKEN"]
    const missingRequired = requiredVars.filter((varName) => !variables[varName])

    if (missingRequired.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Faltan variables de entorno requeridas: ${missingRequired.join(", ")}`,
        variables,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Todas las variables de entorno requeridas están configuradas",
      variables,
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
