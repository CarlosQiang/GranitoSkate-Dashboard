// Importación de GraphQL Request
import { gql, GraphQLClient } from "graphql-request"
import type { Market } from "@/types/markets"

// Cliente GraphQL
const getGraphQLClient = () => {
  const endpoint = process.env.SHOPIFY_API_URL || ""
  const token = process.env.SHOPIFY_ACCESS_TOKEN || ""

  const client = new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Access-Token": token,
    },
  })

  return client
}

// Consulta para obtener mercados
const GET_MARKETS = gql`
  query GetMarkets($first: Int!) {
    markets(first: $first) {
      edges {
        node {
          id
          name
          enabled
          primary
          web {
            domain
            url
          }
        }
      }
    }
  }
`

// Función para obtener mercados
export async function getMarkets(first = 10): Promise<Market[]> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return [
        {
          id: "gid://shopify/Market/1",
          name: "España",
          enabled: true,
          primary: true,
          web: {
            domain: "granito.es",
            url: "https://granito.es",
          },
        },
        {
          id: "gid://shopify/Market/2",
          name: "Estados Unidos",
          enabled: true,
          primary: false,
          web: {
            domain: "granito.com",
            url: "https://granito.com",
          },
        },
        {
          id: "gid://shopify/Market/3",
          name: "México",
          enabled: false,
          primary: false,
          web: {
            domain: "granito.mx",
            url: "https://granito.mx",
          },
        },
      ]
    }

    const client = getGraphQLClient()
    const data = await client.request(GET_MARKETS, { first })

    return data.markets.edges.map((edge: any) => edge.node)
  } catch (error) {
    console.error("Error al obtener mercados:", error)
    return []
  }
}

// Función para obtener un mercado por ID
export async function getMarketById(id: string): Promise<Market | null> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return {
        id: id,
        name: "Mercado de ejemplo",
        enabled: true,
        primary: false,
        web: {
          domain: "ejemplo.com",
          url: "https://ejemplo.com",
        },
      }
    }

    // Implementar la consulta real aquí
    return null
  } catch (error) {
    console.error("Error al obtener el mercado:", error)
    return null
  }
}
