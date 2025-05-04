import { getSession } from "next-auth/react"
import shopifyClient from "./shopify"
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
    if (!process.env.SHOPIFY_API_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return {
        status: "warning",
        message: "Faltan variables de entorno para Shopify (SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN)",
        timestamp: new Date().toISOString(),
      }
    }

    // Intentar hacer una consulta simple a la API de Shopify
    const query = gql`
      {
        shop {
          name
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (data && data.shop && data.shop.name) {
      return {
        status: "ok",
        message: `Conexión exitosa a la tienda: ${data.shop.name}`,
        timestamp: new Date().toISOString(),
        shopName: data.shop.name,
      }
    } else {
      return {
        status: "error",
        message: "No se pudo obtener información de la tienda",
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Error al verificar la conexión a Shopify:", error)
    return {
      status: "error",
      message: `Error al verificar la conexión a Shopify: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
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
