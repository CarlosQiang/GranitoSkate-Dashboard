import { shopifyFetch } from "@/lib/shopify"

export interface Market {
  id: string
  name: string
  enabled: boolean
  primary: boolean
  web: {
    domain: string
    url: string
  }
}

// Consulta para obtener mercados
const GET_MARKETS = `
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
    const data = await shopifyFetch({
      query: GET_MARKETS,
      variables: { first },
    })

    return data.markets.edges.map((edge: any) => edge.node)
  } catch (error) {
    console.error("Error al obtener mercados:", error)
    throw error
  }
}

// Consulta para obtener un mercado por ID
const GET_MARKET_BY_ID = `
  query GetMarketById($id: ID!) {
    market(id: $id) {
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
`

// Función para obtener un mercado por ID
export async function getMarketById(id: string): Promise<Market | null> {
  try {
    const data = await shopifyFetch({
      query: GET_MARKET_BY_ID,
      variables: { id },
    })

    return data.market
  } catch (error) {
    console.error("Error al obtener el mercado:", error)
    throw error
  }
}
