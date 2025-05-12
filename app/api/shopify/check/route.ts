import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado. Debe iniciar sesión para acceder a esta función.",
          details: "Se requiere autenticación para acceder a la API de Shopify",
        },
        { status: 401 },
      )
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain) {
      console.error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return NextResponse.json(
        {
          success: false,
          message: "Configuración de Shopify incompleta",
          details: "Falta el dominio de la tienda (NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN)",
        },
        { status: 500 },
      )
    }

    if (!accessToken) {
      console.error("SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json(
        {
          success: false,
          message: "Configuración de Shopify incompleta",
          details: "Falta el token de acceso (SHOPIFY_ACCESS_TOKEN)",
        },
        { status: 500 },
      )
    }

    // Hacer una consulta simple a la API de Shopify para verificar la conexión
    const query = `
      {
        shop {
          name
          id
          url
          primaryDomain {
            url
          }
        }
      }
    `

    console.log(`Verificando conexión con Shopify (${shopDomain})...`)

    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}): ${errorText}`)

      return NextResponse.json(
        {
          success: false,
          message: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (data.errors) {
      console.error("Errores GraphQL:", JSON.stringify(data.errors, null, 2))

      return NextResponse.json(
        {
          success: false,
          message: "Error en la consulta GraphQL",
          details: JSON.stringify(data.errors),
        },
        { status: 400 },
      )
    }

    if (!data.data || !data.data.shop) {
      return NextResponse.json(
        {
          success: false,
          message: "Respuesta de Shopify incompleta",
          details: "No se pudo obtener información de la tienda",
        },
        { status: 500 },
      )
    }

    console.log("Conexión con Shopify verificada correctamente")

    return NextResponse.json({
      success: true,
      message: "Conexión con Shopify verificada correctamente",
      shopName: data.data.shop.name,
      shopId: data.data.shop.id,
      shopUrl: data.data.shop.url,
      domain: data.data.shop.primaryDomain?.url,
      apiVersion: "2023-10",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la conexión con Shopify",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
