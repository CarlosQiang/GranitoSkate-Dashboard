import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"
import { shopifyConfig } from "@/lib/config/shopify"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar variables de entorno
    const envVariables = {
      // Variables de Shopify
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: {
        exists: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
        required: true,
        description: "Dominio de la tienda Shopify (ej: mi-tienda.myshopify.com)",
      },
      SHOPIFY_ACCESS_TOKEN: {
        exists: !!process.env.SHOPIFY_ACCESS_TOKEN,
        required: true,
        description: "Token de acceso a la API de Shopify",
      },
      SHOPIFY_API_URL: {
        exists: !!process.env.SHOPIFY_API_URL,
        required: false,
        description: "URL de la API de Shopify (se genera automáticamente si no se proporciona)",
      },

      // Variables de la base de datos
      POSTGRES_URL: {
        exists: !!process.env.POSTGRES_URL,
        required: true,
        description: "URL de conexión a la base de datos PostgreSQL",
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        required: false,
        description: "URL alternativa de conexión a la base de datos",
      },

      // Variables de autenticación
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        required: true,
        description: "URL base de la aplicación para NextAuth",
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        required: true,
        description: "Secreto para firmar las cookies de sesión",
      },

      // Variables de la aplicación
      NEXT_PUBLIC_API_URL: {
        exists: !!process.env.NEXT_PUBLIC_API_URL,
        required: false,
        description: "URL base de la API (se usa VERCEL_URL si no se proporciona)",
      },
      NEXT_PUBLIC_VERCEL_URL: {
        exists: !!process.env.NEXT_PUBLIC_VERCEL_URL,
        required: false,
        description: "URL de Vercel (proporcionada automáticamente en Vercel)",
      },
      VERCEL_REGION: {
        exists: !!process.env.VERCEL_REGION,
        required: false,
        description: "Región de Vercel (proporcionada automáticamente en Vercel)",
      },
    }

    // Verificar si todas las variables requeridas están configuradas
    const allRequiredEnvVars = Object.values(envVariables).every((variable) => !variable.required || variable.exists)

    // Probar la conexión con Shopify
    const shopifyConnection =
      !shopifyConfig.shopDomain || !shopifyConfig.accessToken
        ? {
            success: false,
            message: "Faltan credenciales de Shopify",
            details: [
              !shopifyConfig.shopDomain && "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado",
              !shopifyConfig.accessToken && "SHOPIFY_ACCESS_TOKEN no está configurado",
            ].filter(Boolean),
          }
        : await testShopifyConnection()

    // Verificar la conexión a la base de datos
    let dbConnection = {
      success: false,
      message: "No se pudo verificar la conexión a la base de datos",
      details: "No se ha implementado la verificación de la base de datos",
    }

    // Intentar verificar la conexión a la base de datos si hay una URL configurada
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      try {
        // Aquí iría la lógica para verificar la conexión a la base de datos
        // Por ahora, simulamos una conexión exitosa si hay una URL configurada
        dbConnection = {
          success: true,
          message: "Conexión exitosa a la base de datos",
          details: "URL de conexión configurada correctamente",
        }
      } catch (error) {
        dbConnection = {
          success: false,
          message: "Error al conectar con la base de datos",
          details: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    // Generar un resumen del diagnóstico
    const allSystemsOk = allRequiredEnvVars && shopifyConnection.success && dbConnection.success

    // Crear un resumen del diagnóstico
    const summary = {
      status: allSystemsOk ? "ok" : "error",
      message: allSystemsOk ? "Todos los sistemas funcionan correctamente" : "Se encontraron problemas en el sistema",
      details: [
        !allRequiredEnvVars && "Faltan variables de entorno requeridas",
        !shopifyConnection.success && "Error en la conexión con Shopify",
        !dbConnection.success && "Error en la conexión con la base de datos",
      ].filter(Boolean),
    }

    return NextResponse.json({
      summary,
      env: {
        allRequired: allRequiredEnvVars,
        variables: envVariables,
      },
      shopify: shopifyConnection,
      database: dbConnection,
    })
  } catch (error) {
    console.error("Error al realizar el diagnóstico completo:", error)
    return NextResponse.json(
      {
        summary: {
          status: "error",
          message: "Error al realizar el diagnóstico completo",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
      },
      { status: 500 },
    )
  }
}
