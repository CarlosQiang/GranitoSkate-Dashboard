import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno
    const missingEnvVars = []

    if (!process.env.SHOPIFY_API_URL) {
      missingEnvVars.push("SHOPIFY_API_URL")
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      missingEnvVars.push("SHOPIFY_ACCESS_TOKEN")
    }

    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
      missingEnvVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
    }

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Faltan las siguientes variables de entorno: ${missingEnvVars.join(", ")}`,
          missingEnvVars,
        },
        { status: 400 },
      )
    }

    // Probar conexión con Shopify
    const endpoint = process.env.SHOPIFY_API_URL
    const key = process.env.SHOPIFY_ACCESS_TOKEN

    const query = `
      query {
        shop {
          name
          id
        }
      }
    `

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": key,
      },
      body: JSON.stringify({
        query,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Error en la respuesta de Shopify (${response.status}): ${text}`,
          status: response.status,
          responseText: text,
        },
        { status: 500 },
      )
    }

    const result = await response.json()

    if (result.errors) {
      return NextResponse.json(
        {
          success: false,
          message: `Error en la API de Shopify: ${result.errors.map((e: any) => e.message).join(", ")}`,
          errors: result.errors,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Conexión exitosa con la tienda ${result.data?.shop?.name || "Shopify"}`,
      shopInfo: result.data?.shop,
      envVars: {
        SHOPIFY_API_URL: process.env.SHOPIFY_API_URL?.substring(0, 30) + "...",
        NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
        hasAccessToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error desconocido al probar la conexión con Shopify",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
