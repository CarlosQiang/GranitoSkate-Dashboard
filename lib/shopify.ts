import { GraphQLClient } from "graphql-request"

// Obtener las credenciales de Shopify desde las variables de entorno
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN

// Crear el cliente GraphQL para Shopify
let shopifyClient = null

// Verificar si las credenciales están configuradas antes de crear el cliente
if (shopifyDomain && shopifyAccessToken) {
  const apiUrl = `https://${shopifyDomain}/admin/api/2023-10/graphql.json`

  shopifyClient = new GraphQLClient(apiUrl, {
    headers: {
      "X-Shopify-Access-Token": shopifyAccessToken,
      "Content-Type": "application/json",
    },
  })
}

// Función para realizar consultas GraphQL a Shopify
export async function shopifyFetch({ query, variables = {} }) {
  try {
    // Verificar que las credenciales estén configuradas
    if (!shopifyDomain) {
      console.error("Error: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return {
        data: null,
        errors: [{ message: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado" }],
      }
    }

    if (!shopifyAccessToken) {
      console.error("Error: SHOPIFY_ACCESS_TOKEN no está configurado")
      return {
        data: null,
        errors: [{ message: "SHOPIFY_ACCESS_TOKEN no está configurado" }],
      }
    }

    if (!shopifyClient) {
      console.error("Error: Cliente de Shopify no inicializado")
      return {
        data: null,
        errors: [{ message: "Cliente de Shopify no inicializado" }],
      }
    }

    const result = await shopifyClient.request(query, variables)

    return { data: result, errors: null }
  } catch (error) {
    console.error("Error en la consulta GraphQL:", error)
    return {
      data: null,
      errors: [{ message: error.message }],
    }
  }
}

// Función para formatear IDs de Shopify
export function formatShopifyId(id, type) {
  if (!id) return `gid://shopify/${type}/0`
  if (id.includes("gid://shopify/")) return id
  return `gid://shopify/${type}/${id}`
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid) {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

// Exportar el cliente
export default shopifyClient
