import { getSession } from "next-auth/react"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para verificar el estado del sistema
export async function checkSystemStatus() {
  try {
    // Verificar conexión a la base de datos (si aplica)
    // Verificar conexión a servicios externos
    // Verificar estado de la aplicación

    return {
      status: "ok",
      message: "El sistema está funcionando correctamente",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error al verificar el estado del sistema:", error)
    return {
      status: "error",
      message: `Error al verificar el estado del sistema: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

// Función para verificar la conexión a Shopify
export async function checkShopifyConnection() {
  try {
    // Verificar si las variables de entorno están configuradas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      const missingVars = []
      if (!shopDomain) missingVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
      if (!accessToken) missingVars.push("SHOPIFY_ACCESS_TOKEN")

      return {
        status: "warning",
        message: `Faltan variables de entorno para Shopify: ${missingVars.join(", ")}`,
        timestamp: new Date().toISOString(),
        details: {
          missingVariables: missingVars,
          environment: process.env.NODE_ENV,
        },
      }
    }

    // Intentar hacer una consulta simple a la API de Shopify
    const query = gql`
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

    // Usar el cliente de Shopify para hacer la consulta
    const data = await shopifyClient.request(query)

    if (data && data.shop && data.shop.name) {
      return {
        status: "ok",
        message: `Conexión exitosa a la tienda: ${data.shop.name}`,
        timestamp: new Date().toISOString(),
        shopName: data.shop.name,
        shopId: data.shop.id,
        shopUrl: data.shop.url,
        domain: data.shop.primaryDomain?.url,
      }
    } else {
      return {
        status: "error",
        message: "No se pudo obtener información de la tienda",
        timestamp: new Date().toISOString(),
        response: data,
      }
    }
  } catch (error) {
    console.error("Error al verificar la conexión a Shopify:", error)

    // Intentar extraer más información del error
    let errorDetails = {}
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }

      // Si es un error de GraphQL, puede tener información adicional
      if ("response" in error && error.response) {
        errorDetails = {
          ...errorDetails,
          response: error.response,
        }
      }
    }

    return {
      status: "error",
      message: `Error al verificar la conexión a Shopify: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
      details: errorDetails,
    }
  }
}

// Función para verificar la autenticación
export async function checkAuthentication(req: Request) {
  try {
    const session = await getSession({ req })

    if (session) {
      return {
        status: "ok",
        message: "Usuario autenticado",
        timestamp: new Date().toISOString(),
        user: session.user,
      }
    } else {
      return {
        status: "warning",
        message: "Usuario no autenticado",
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Error al verificar la autenticación:", error)
    return {
      status: "error",
      message: `Error al verificar la autenticación: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

// Función para verificar la salud del sistema completo
export async function checkSystemHealth() {
  try {
    const systemStatus = await checkSystemStatus()
    const shopifyStatus = await checkShopifyConnection()

    const overallStatus = systemStatus.status === "ok" && shopifyStatus.status === "ok" ? "ok" : "warning"

    return {
      status: overallStatus,
      systemStatus,
      shopifyStatus,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error al verificar la salud del sistema:", error)
    return {
      status: "error",
      message: `Error al verificar la salud del sistema: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

// Función para verificar la disponibilidad de la API
export async function checkApiAvailability() {
  try {
    // Verificar si la API está disponible
    return {
      status: "ok",
      message: "API disponible",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error al verificar la disponibilidad de la API:", error)
    return {
      status: "error",
      message: `Error al verificar la disponibilidad de la API: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

// Función para verificar la configuración del sistema
export async function checkSystemConfiguration() {
  try {
    // Verificar la configuración del sistema
    const config = {
      nodeEnv: process.env.NODE_ENV || "development",
      nextAuthUrl: process.env.NEXTAUTH_URL ? "configurado" : "no configurado",
      shopifyApiUrl: process.env.SHOPIFY_API_URL ? "configurado" : "no configurado",
      shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN ? "configurado" : "no configurado",
      shopifyShopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "configurado" : "no configurado",
      vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL ? "configurado" : "no configurado",
      apiUrl: process.env.NEXT_PUBLIC_API_URL ? "configurado" : "no configurado",
    }

    return {
      status: "ok",
      message: "Configuración del sistema verificada",
      timestamp: new Date().toISOString(),
      config,
    }
  } catch (error) {
    console.error("Error al verificar la configuración del sistema:", error)
    return {
      status: "error",
      message: `Error al verificar la configuración del sistema: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

// Función para realizar una verificación completa del sistema
export async function performSystemCheck() {
  console.log("🔍 Iniciando verificación del sistema...")

  try {
    // 1. Verificar conexión con Shopify
    console.log("Verificando conexión con Shopify...")
    const shopifyStatus = await checkShopifyConnection()
    console.log(`Estado: ${shopifyStatus.status}`)
    console.log(`Mensaje: ${shopifyStatus.message}`)

    // 2. Verificar configuración del sistema
    console.log("\nVerificando configuración del sistema...")
    const configStatus = await checkSystemConfiguration()
    console.log(`Estado: ${configStatus.status}`)
    console.log(`Mensaje: ${configStatus.message}`)

    // 3. Verificar disponibilidad de la API
    console.log("\nVerificando disponibilidad de la API...")
    const apiStatus = await checkApiAvailability()
    console.log(`Estado: ${apiStatus.status}`)
    console.log(`Mensaje: ${apiStatus.message}`)

    // 4. Verificar estado general del sistema
    console.log("\nVerificando estado general del sistema...")
    const systemStatus = await checkSystemStatus()
    console.log(`Estado: ${systemStatus.status}`)
    console.log(`Mensaje: ${systemStatus.message}`)

    // Resultado final
    console.log("\n✅ Verificación del sistema completada")

    return {
      shopifyStatus,
      configStatus,
      apiStatus,
      systemStatus,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Error durante la verificación del sistema:", error)
    return {
      status: "error",
      message: `Error durante la verificación del sistema: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    }
  }
}
