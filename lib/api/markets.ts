import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { MarketData } from "@/types/markets"

// Función para obtener los mercados disponibles
export async function fetchMarkets() {
  try {
    const query = gql`
      query {
        markets(first: 50) {
          edges {
            node {
              id
              name
              enabled
              primary
              web {
                domain {
                  url
                }
                rootDirectory
                defaultLocale
                alternateLocales
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.markets.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching markets:", error)
    throw new Error(`Error al cargar mercados: ${error.message}`)
  }
}

// Función para obtener un mercado por ID
export async function fetchMarketById(id: string) {
  try {
    const query = gql`
      query GetMarket($id: ID!) {
        market(id: $id) {
          id
          name
          enabled
          primary
          web {
            domain {
              url
            }
            rootDirectory
            defaultLocale
            alternateLocales
          }
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)
    return data.market
  } catch (error) {
    console.error(`Error fetching market with ID ${id}:`, error)
    throw new Error(`Error al cargar el mercado: ${error.message}`)
  }
}

// Función para crear un nuevo mercado
export async function createMarket(marketData: MarketData) {
  try {
    const mutation = gql`
      mutation marketCreate($input: MarketCreateInput!) {
        marketCreate(input: $input) {
          market {
            id
            name
            enabled
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: marketData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.marketCreate.userErrors.length > 0) {
      throw new Error(data.marketCreate.userErrors[0].message)
    }

    return data.marketCreate.market
  } catch (error) {
    console.error("Error creating market:", error)
    throw new Error(`Error al crear el mercado: ${error.message}`)
  }
}

// Función para actualizar un mercado existente
export async function updateMarket(id: string, marketData: Partial<MarketData>) {
  try {
    const mutation = gql`
      mutation marketUpdate($id: ID!, $input: MarketUpdateInput!) {
        marketUpdate(id: $id, input: $input) {
          market {
            id
            name
            enabled
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id,
      input: marketData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.marketUpdate.userErrors.length > 0) {
      throw new Error(data.marketUpdate.userErrors[0].message)
    }

    return data.marketUpdate.market
  } catch (error) {
    console.error(`Error updating market with ID ${id}:`, error)
    throw new Error(`Error al actualizar el mercado: ${error.message}`)
  }
}

// Función para eliminar un mercado
export async function deleteMarket(id: string) {
  try {
    const mutation = gql`
      mutation marketDelete($id: ID!) {
        marketDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.marketDelete.userErrors.length > 0) {
      throw new Error(data.marketDelete.userErrors[0].message)
    }

    return data.marketDelete.deletedId
  } catch (error) {
    console.error(`Error deleting market with ID ${id}:`, error)
    throw new Error(`Error al eliminar el mercado: ${error.message}`)
  }
}

// Función para obtener la presencia web
export async function fetchWebPresence() {
  try {
    const query = gql`
      query {
        shop {
          id
          name
          myshopifyDomain
          primaryDomain {
            url
            host
          }
          domains {
            id
            url
            sslEnabled
            localization {
              country {
                code
                name
              }
              language {
                code
                name
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return {
      shop: data.shop,
      domains: data.shop.domains,
    }
  } catch (error) {
    console.error("Error fetching web presence:", error)
    throw new Error(`Error al cargar la presencia web: ${error.message}`)
  }
}

// Función para guardar la configuración de SEO
export async function saveSeoSettings(settings: any) {
  try {
    // Implementar la lógica para guardar la configuración de SEO
    // Esto podría implicar actualizar metafields o usar una API específica

    // Ejemplo de actualización de metafields
    const mutation = gql`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      metafields: [
        {
          ownerId: "gid://shopify/Shop/1",
          namespace: "seo",
          key: "settings",
          value: JSON.stringify(settings),
          type: "json",
        },
      ],
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldsSet.userErrors.length > 0) {
      throw new Error(data.metafieldsSet.userErrors[0].message)
    }

    return data.metafieldsSet.metafields
  } catch (error) {
    console.error("Error saving SEO settings:", error)
    throw new Error(`Error al guardar la configuración de SEO: ${error.message}`)
  }
}
