import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify-diagnostics"

export async function GET() {
  try {
    // Usar la función de diagnóstico existente para probar la conexión
    const result = await testShopifyConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        shopName: result.data?.shop?.name || "Tienda Shopify",
        message: "Conexión establecida correctamente",
      })
    } else {
      console.error("Error de conexión con Shopify:", result.message)
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Error desconocido al conectar con Shopify",
        },
        { status: 200 },
      ) // Devolvemos 200 para manejar el error en el cliente
    }
  } catch (error) {
    console.error("Error inesperado al verificar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error general: ${(error as Error).message}`,
      },
      { status: 200 },
    ) // Devolvemos 200 para manejar el error en el cliente
  }
}

// También permitimos POST para mantener compatibilidad con código existente
export async function POST() {
  return GET()
}
