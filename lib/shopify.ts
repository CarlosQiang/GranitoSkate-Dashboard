import { GraphQLClient } from "graphql-request"

// Obtener la URL base para las solicitudes a la API de Shopify
function getBaseUrl(): string {
  // Verificar si estamos en un entorno de producción o desarrollo
  const isProduction = process.env.NODE_ENV === "production"

  // Usar la URL de la API de Shopify configurada en las variables de entorno
  const apiUrl = process.env.SHOPIFY_API_URL || ""

  // Si no hay una URL configurada, usar una URL por defecto para desarrollo
  if (!apiUrl && !isProduction) {
    return "https://granitoskate.myshopify.com/admin/api/2023-10/graphql.json"
  }

  // Si no hay una URL configurada en producción, lanzar un error
  if (!apiUrl && isProduction) {
    console.error("SHOPIFY_API_URL no está configurada en las variables de entorno")
    return "https://granitoskate.myshopify.com/admin/api/2023-10/graphql.json"
  }

  return apiUrl
}

// Crear un cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(getBaseUrl(), {
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
    "Content-Type": "application/json",
  },
})

export default shopifyClient
