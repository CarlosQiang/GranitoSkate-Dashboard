import { GraphQLClient } from "graphql-request"

// Configuración del cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(process.env.SHOPIFY_API_URL || "", {
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
    "Content-Type": "application/json",
  },
})

export default shopifyClient

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
      shop: data.shop,
    }
  } catch (error) {
    console.error("Error al conectar con Shopify:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Función para formatear un ID de Shopify
export function formatShopifyId(id: string, type: string): string {
  if (id.includes("gid://shopify/")) {
    return id
  }

  return `gid://shopify/${type}/${id}`
}

// Función para extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid: string): string {
  if (!gid) return ""

  const parts = gid.split("/")
  return parts[parts.length - 1]
}
