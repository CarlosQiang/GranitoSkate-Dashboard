import { type NextRequest, NextResponse } from "next/server"

// Aumentar el tiempo de timeout para la solicitud
export const maxDuration = 60 // 60 segundos

export async function POST(request: NextRequest) {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Variables de entorno de Shopify no definidas")
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de Shopify incompleta. Verifica las variables de entorno.",
        },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

    // Realizar la solicitud a la API de Shopify
    const shopifyResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text()
      console.error("Error en la respuesta de Shopify:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Error en la API de Shopify: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
        },
        { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error en el servidor: ${(error as Error).message}`,
      },
      { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
    )
  }
}

// También permitimos GET para pruebas de conexión
export async function GET() {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Variables de entorno de Shopify no definidas")
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de Shopify incompleta. Verifica las variables de entorno.",
        },
        { status: 500 },
      )
    }

    // Consulta simple para verificar la conexión
    const query = `
      {
        shop {
          name
          url
        }
      }
    `

    // Realizar la solicitud a la API de Shopify
    const shopifyResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text()
      console.error("Error en la respuesta de Shopify:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Error en la API de Shopify: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
        },
        { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json({
      success: true,
      shopName: data?.data?.shop?.name || "Tienda Shopify",
      message: "Conexión establecida correctamente",
    })
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error en el servidor: ${(error as Error).message}`,
      },
      { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
    )
  }
}
