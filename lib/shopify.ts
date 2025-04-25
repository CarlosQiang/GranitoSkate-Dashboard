import { GraphQLClient } from "graphql-request"

// Función para obtener la URL base de la aplicación
const getBaseUrl = () => {
  // En el navegador, usamos la URL actual
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // En el servidor, usamos la URL de Vercel o localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

// Configuración del cliente GraphQL para Shopify a través del proxy
const shopifyClient = new GraphQLClient(`${getBaseUrl()}/api/shopify`, {
  headers: {
    "Content-Type": "application/json",
  },
})

export default shopifyClient
