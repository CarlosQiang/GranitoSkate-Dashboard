import { GraphQLClient } from "graphql-request"

// Configuración del cliente GraphQL para Shopify a través del proxy
// Usamos una URL relativa para que funcione tanto en desarrollo como en producción
const shopifyClient = new GraphQLClient("/api/shopify", {
  headers: {
    "Content-Type": "application/json",
  },
})

export default shopifyClient
