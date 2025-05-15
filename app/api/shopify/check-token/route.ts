import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.role === "ADMIN") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener el token del cuerpo de la solicitud
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no proporcionado" }, { status: 400 })
    }

    // Obtener el dominio de Shopify
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    if (!shopifyDomain) {
      return NextResponse.json({ success: false, message: "Dominio de Shopify no configurado" }, { status: 500 })
    }

    // Verificar el token consultando la API de Shopify
    const shopResponse = await fetch(`https://${shopifyDomain}/admin/api/2023-10/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": token,
      },
    })

    if (!shopResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Token inválido o sin permisos suficientes: ${shopResponse.status} ${shopResponse.statusText}`,
          statusCode: shopResponse.status,
        },
        { status: 400 },
      )
    }

    // Obtener información sobre los permisos del token
    const scopesResponse = await fetch(`https://${shopifyDomain}/admin/oauth/access_scopes.json`, {
      headers: {
        "X-Shopify-Access-Token": token,
      },
    })

    let scopes = []
    if (scopesResponse.ok) {
      const scopesData = await scopesResponse.json()
      scopes = scopesData.access_scopes.map((scope: any) => scope.handle)
    }

    // Verificar si tiene los permisos necesarios
    const requiredScopes = [
      "read_products",
      "write_products",
      "read_product_listings",
      "read_collections",
      "write_collections",
    ]

    const missingScopes = requiredScopes.filter((scope) => !scopes.includes(scope))

    return NextResponse.json({
      success: true,
      message: "Token válido",
      scopes,
      hasAllRequiredScopes: missingScopes.length === 0,
      missingScopes,
    })
  } catch (error) {
    console.error("Error al verificar token de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
