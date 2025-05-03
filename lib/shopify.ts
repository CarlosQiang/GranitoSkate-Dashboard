import { GraphQLClient } from "graphql-request"

// Verificar que las variables de entorno estén definidas
const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

if (!shopDomain) {
  console.warn("⚠️ NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está definido en las variables de entorno")
}

if (!accessToken) {
  console.warn("⚠️ SHOPIFY_ACCESS_TOKEN no está definido en las variables de entorno")
}

// Crear el cliente GraphQL con un timeout más largo
const shopifyClient = new GraphQLClient(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
  headers: {
    "X-Shopify-Access-Token": accessToken || "",
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos de timeout
})

// Añadir interceptor para manejar errores comunes
const originalRequest = shopifyClient.request.bind(shopifyClient)
shopifyClient.request = async (...args) => {
  try {
    return await originalRequest(...args)
  } catch (error) {
    console.error("Error en la solicitud a Shopify API:", error)

    // Añadir información adicional al error
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        console.error("Error de autenticación: Verifica tu SHOPIFY_ACCESS_TOKEN")
      } else if (error.message.includes("404")) {
        console.error("Error 404: Verifica tu NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
      } else if (error.message.includes("429")) {
        console.error("Error 429: Has excedido el límite de solicitudes a la API")
      }
    }

    throw error
  }
}

export default shopifyClient
