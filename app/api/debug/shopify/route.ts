import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar variables de entorno
    const envCheck = {
      SHOPIFY_API_URL: process.env.SHOPIFY_API_URL || "No configurado",
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "Configurado (valor oculto)" : "No configurado",
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "No configurado",
    }

    // Intentar una consulta simple a Shopify
    let shopifyResponse = null
    let shopifyError = null

    try {
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

      shopifyResponse = await shopifyFetch({ query })
    } catch (error) {
      shopifyError = {
        message: error.message,
        stack: error.stack,
      }
    }

    // Verificar la conexión a la base de datos
    let dbStatus = "No verificado"
    let dbError = null

    try {
      const { query } = await import("@/lib/db")
      const result = await query("SELECT NOW()", [])
      dbStatus = "Conectado"
    } catch (error) {
      dbStatus = "Error de conexión"
      dbError = {
        message: error.message,
        stack: error.stack,
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: {
        environment: process.env.VERCEL_ENV || "No disponible",
        region: process.env.VERCEL_REGION || "No disponible",
      },
      env: envCheck,
      shopify: {
        response: shopifyResponse,
        error: shopifyError,
      },
      database: {
        status: dbStatus,
        error: dbError,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}
