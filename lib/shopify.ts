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
  timeout: 60000, // 60 segundos de timeout para operaciones largas
})

// Función para formatear correctamente los IDs de Shopify
export function formatShopifyId(id: string, type = "Product") {
  if (id.startsWith("gid://")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

// Función para realizar una consulta de prueba a Shopify
export async function testShopifyConnection() {
  try {
    const query = `
      {
        shop {
          name
          url
        }
      }
    `

    const data = await shopifyClient.request(query)
    return {
      success: true,
      data,
      message: "Conexión exitosa con Shopify",
    }
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Exportar el cliente de Shopify
export default shopifyClient

// Función para obtener el cliente de Shopify (para compatibilidad con código existente)
export const getShopifyApi = async () => {
  return shopifyClient
}
