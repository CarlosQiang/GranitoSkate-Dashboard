import { GraphQLClient } from "graphql-request"

// Configuración del cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(
  process.env.SHOPIFY_API_URL ||
    `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      "Content-Type": "application/json",
    },
    timeout: 30000, // Aumentar timeout a 30 segundos
  },
)

export default shopifyClient

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
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
    console.log("Conexión exitosa con Shopify:", data)
    return {
      success: true,
      shop: data.shop,
    }
  } catch (error) {
    console.error("Error checking Shopify connection:", error)
    return {
      success: false,
      error: error.message || "Error connecting to Shopify",
    }
  }
}

// Función para formatear IDs de Shopify
export function formatShopifyId(id, type) {
  if (!id) return null
  if (id.includes("gid://shopify/")) return id
  return `gid://shopify/${type}/${id}`
}

// Función para extraer ID numérico de un ID de Shopify
export function extractIdFromGid(gid) {
  if (!gid) return null
  if (!gid.includes("gid://shopify/")) return gid
  return gid.split("/").pop()
}
