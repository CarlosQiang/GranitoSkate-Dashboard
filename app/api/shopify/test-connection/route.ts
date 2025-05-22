import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar que las variables de entorno estén configuradas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN
    const apiUrl =
      process.env.SHOPIFY_API_URL || (shopDomain ? `https://${shopDomain}/admin/api/2023-07/graphql.json` : null)

    const missingVars = []
    if (!shopDomain) missingVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN o SHOPIFY_STORE_DOMAIN")
    if (!accessToken) missingVars.push("SHOPIFY_ACCESS_TOKEN")
    if (!apiUrl) missingVars.push("SHOPIFY_API_URL")

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Faltan variables de entorno: ${missingVars.join(", ")}`,
          env: {
            SHOPIFY_API_URL: apiUrl ? "Configurado" : "No configurado",
            SHOPIFY_ACCESS_TOKEN: accessToken ? "Configurado" : "No configurado",
            NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "Configurado" : "No configurado",
          },
        },
        { status: 400 },
      )
    }

    // Consulta GraphQL simple para probar la conexión
    const query = `
      query {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `

    console.log(`Verificando conexión con Shopify (${shopDomain})...`)

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    if (response.errors) {
      return NextResponse.json(
        {
          success: false,
          error: "Error en la API de Shopify",
          details: response.errors,
          env: {
            SHOPIFY_API_URL: apiUrl ? "Configurado" : "No configurado",
            SHOPIFY_ACCESS_TOKEN: accessToken ? "Configurado" : "No configurado",
            NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "Configurado" : "No configurado",
          },
        },
        { status: 500 },
      )
    }

    if (!response.data || !response.data.shop) {
      return NextResponse.json(
        {
          success: false,
          error: "Respuesta de Shopify inválida",
          response,
          env: {
            SHOPIFY_API_URL: apiUrl ? "Configurado" : "No configurado",
            SHOPIFY_ACCESS_TOKEN: accessToken ? "Configurado" : "No configurado",
            NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "Configurado" : "No configurado",
          },
        },
        { status: 500 },
      )
    }

    // Conexión exitosa
    return NextResponse.json({
      success: true,
      shop: response.data.shop,
      env: {
        SHOPIFY_API_URL: apiUrl ? "Configurado" : "No configurado",
        SHOPIFY_ACCESS_TOKEN: accessToken ? "Configurado" : "No configurado",
        NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "Configurado" : "No configurado",
      },
    })
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        env: {
          SHOPIFY_API_URL: process.env.SHOPIFY_API_URL ? "Configurado" : "No configurado",
          SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "Configurado" : "No configurado",
          NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
            ? "Configurado"
            : "No configurado",
        },
      },
      { status: 500 },
    )
  }
}
