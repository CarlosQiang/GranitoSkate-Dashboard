import { GraphQLClient } from "graphql-request"

// Verificar que las variables de entorno estén definidas
const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

if (!shopDomain || !accessToken) {
  console.warn(
    "⚠️ Configuración de Shopify incompleta. Asegúrate de definir NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN en tu archivo .env.local",
  )
}

// Crear el cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
  headers: {
    "X-Shopify-Access-Token": accessToken || "",
    "Content-Type": "application/json",
  },
  timeout: 30000, // Aumentar el tiempo de espera a 30 segundos
})

export default shopifyClient
