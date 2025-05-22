import { NextResponse } from "next/server"
import { shopifyConfig } from "@/lib/config/shopify"
import { testShopifyConnection } from "@/lib/shopify"
import db from "@/lib/db"

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
        // Verificar la conexión a la base de datos
        const testResult = await db.testConnection()

        dbConnection = {
          success: testResult,
          message: testResult
            ? "Conexión exitosa a la base de datos"
            : "Error al conectar con la base de datos. Verifica las credenciales.",
        }
      } catch (error) {
        dbConnection = {
          success: false,
          message: "Error al conectar con la base de datos",
          details: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    // Verificar la estructura de la base de datos
    let dbStructure = {
      success: false,
      message: "No se pudo verificar la estructura de la base de datos",
      details: "No se ha implementado la verificación de la estructura de la base de datos",
    }

    // Intentar verificar la estructura de la base de datos si la conexión es exitosa
    if (dbConnection.success) {
      try {
        // Verificar si existen las tablas necesarias
        const tablesResult = await db.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('productos', 'colecciones', 'registro_sincronizacion')
        `)

        const existingTables = tablesResult.rows.map((row) => row.table_name)
        const requiredTables = ["productos", "colecciones", "registro_sincronizacion"]
        const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

        dbStructure = {
          success: missingTables.length === 0,
          message:
            missingTables.length === 0
              ? "Estructura de la base de datos correcta"
              : `Faltan tablas en la base de datos: ${missingTables.join(", ")}`,
          details: {
            existingTables,
            missingTables,
          },
        }
      } catch (error) {
        dbStructure = {
          success: false,
          message: "Error al verificar la estructura de la base de datos",
          details: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    // Verificar la sincronización con Shopify
    let syncStatus = {
      success: false,
      message: "No se pudo verificar la sincronización con Shopify",
      details: "No se ha implementado la verificación de la sincronización con Shopify",
    }

    // Intentar verificar la sincronización con Shopify si la conexión es exitosa
    if (shopifyConnection.success && dbConnection.success) {
      try {
        // Verificar si hay productos sincronizados
        const productsResult = await db.query(`
          SELECT COUNT(*) as count
          FROM productos
        `)

        const productsCount = Number.parseInt(productsResult.rows[0].count, 10)

        // Verificar si hay colecciones sincronizadas
        const collectionsResult = await db.query(`
          SELECT COUNT(*) as count
          FROM colecciones
        `)

        const collectionsCount = Number.parseInt(collectionsResult.rows[0].count, 10)

        // Verificar si hay registros de sincronización
        const syncResult = await db.query(`
          SELECT COUNT(*) as count
          FROM registro_sincronizacion
        `)

        const syncCount = Number.parseInt(syncResult.rows[0].count, 10)

        syncStatus = {
          success: productsCount > 0 || collectionsCount > 0,
          message:
            productsCount > 0 || collectionsCount > 0
              ? `Sincronización correcta: ${productsCount} productos y ${collectionsCount} colecciones sincronizados`
              : "No hay datos sincronizados con Shopify",
          details: {
            productsCount,
            collectionsCount,
            syncCount,
          },
        }
      } catch (error) {
        syncStatus = {
          success: false,
          message: "Error al verificar la sincronización con Shopify",
          details: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    // Generar un resumen del diagnóstico
    const allSystemsOk = allRequiredEnvVars && shopifyConnection.success && dbConnection.success && dbStructure.success

    // Crear un resumen del diagnóstico
    const summary = {
      status: allSystemsOk ? "ok" : "error",
      message: allSystemsOk ? "Todos los sistemas funcionan correctamente" : "Se encontraron problemas en el sistema",
      details: [
        !allRequiredEnvVars && "Faltan variables de entorno requeridas",
        !shopifyConnection.success && "Error en la conexión con Shopify",
        !dbConnection.success && "Error en la conexión con la base de datos",
        !dbStructure.success && "Error en la estructura de la base de datos",
        !syncStatus.success && "No hay datos sincronizados con Shopify",
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
      dbStructure,
      sync: syncStatus,
    })
  } catch (error) {
    console.error("Error al realizar la verificación completa:", error)
    return NextResponse.json(
      {
        summary: {
          status: "error",
          message: "Error al realizar la verificación completa",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
      },
      { status: 500 },
    )
  }
}
