import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar que las variables de entorno estén definidas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Variables de entorno de Shopify no definidas:", {
        NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "defined" : "undefined",
        SHOPIFY_ACCESS_TOKEN: accessToken ? "defined" : "undefined",
      })

      return NextResponse.json(
        {
          success: false,
          message: "Variables de entorno de Shopify no definidas",
          details: {
            NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "defined" : "undefined",
            SHOPIFY_ACCESS_TOKEN: accessToken ? "defined" : "undefined",
          },
        },
        { status: 500 },
      )
    }

    // Consulta a la API de Shopify para verificar la conexión
    const query = `{
      shop {
        name
        id
      }
    }`

    const response = await fetch(`https://${shopDomain}/admin/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en la respuesta de Shopify:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Error al conectar con Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (data.errors) {
      console.error("Errores en la respuesta de Shopify:", data.errors)

      return NextResponse.json(
        {
          success: false,
          message: "Error en la consulta a Shopify",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexión con Shopify establecida correctamente",
      data: data.data,
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Error al verificar la conexión con Shopify: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
