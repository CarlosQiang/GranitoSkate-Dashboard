import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SHOPIFY_API_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "SHOPIFY_API_URL no está configurado",
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

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "SHOPIFY_ACCESS_TOKEN no está configurado",
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

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    if (response.errors) {
      return NextResponse.json(
        {
          success: false,
          error: "Error en la API de Shopify",
          details: response.errors,
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

    if (!response.data || !response.data.shop) {
      return NextResponse.json(
        {
          success: false,
          error: "Respuesta de Shopify inválida",
          response,
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

    // Conexión exitosa
    return NextResponse.json({
      success: true,
      shop: response.data.shop,
      env: {
        SHOPIFY_API_URL: process.env.SHOPIFY_API_URL ? "Configurado" : "No configurado",
        SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "Configurado" : "No configurado",
        NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "Configurado" : "No configurado",
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
