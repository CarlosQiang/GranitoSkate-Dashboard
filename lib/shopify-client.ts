import { GraphQLClient } from "graphql-request"

// Obtener las variables de entorno
const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

// Verificar que las variables de entorno estén definidas
if (!shopDomain || !accessToken) {
  console.error("Error: Variables de entorno de Shopify no configuradas correctamente")
}

// Crear el cliente GraphQL
export const shopifyClient = new GraphQLClient(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
  headers: {
    "X-Shopify-Access-Token": accessToken || "",
    "Content-Type": "application/json",
  },
})

// Función para verificar la conexión con Shopify
export async function testShopifyConnection() {
  try {
    const query = `
      {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `
    const data = await shopifyClient.request(query)
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error al conectar con Shopify:", error)
    return {
      success: false,
      error,
    }
  }
}
