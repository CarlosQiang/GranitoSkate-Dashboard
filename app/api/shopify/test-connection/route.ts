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

    // Obtener configuración de Shopify
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Verificar si la configuración es válida
    if (!shopDomain) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Falta el dominio de la tienda Shopify. Verifica la variable de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN o SHOPIFY_STORE_DOMAIN.",
        },
        { status: 400 },
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Falta el token de acceso de Shopify. Verifica la variable de entorno SHOPIFY_ACCESS_TOKEN.",
        },
        { status: 400 },
      )
    }

    // Construir la URL de la API de Shopify
    const apiUrl = `https://${shopDomain}/admin/api/2023-07/shop.json`

    // Realizar la solicitud a la API de Shopify
    const response = await fetch(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.text()
        errorMessage += ` - ${errorData}`
      } catch (e) {
        // Ignorar errores al leer el cuerpo de la respuesta
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          statusCode: response.status,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      shopName: data.shop.name,
      shopDomain: data.shop.domain,
      shopEmail: data.shop.email,
      shopPlan: data.shop.plan_name,
      shopCreatedAt: data.shop.created_at,
      shopUpdatedAt: data.shop.updated_at,
    })
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
