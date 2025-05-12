import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Market, WebPresence, SeoSettings } from "@/types/markets"

// Obtener todos los mercados configurados
export async function fetchMarkets(): Promise<Market[]> {
  try {
    const query = gql`
      query {
        markets {
          edges {
            node {
              id
              name
              enabled
              primary
              currency {
                code
                symbol
              }
              webPresence {
                domain
                subfolderSuffix
              }
              regions {
                edges {
                  node {
                    id
                    name
                    countryCode
                    subregions {
                      code
                      name
                    }
                  }
                }
              }
              languages {
                locale
                primary
                name
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Transformar la respuesta de Shopify al formato que esperamos
    return data.markets.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id,
        name: node.name,
        enabled: node.enabled,
        primary: node.primary,
        web: {
          domain: node.webPresence?.domain || null,
          subfolderSuffix: node.webPresence?.subfolderSuffix || null,
        },
        currency: {
          code: node.currency.code,
          symbol: node.currency.symbol,
        },
        regions: node.regions.edges.map((regionEdge: any) => {
          const regionNode = regionEdge.node
          return {
            id: regionNode.id,
            name: regionNode.name,
            countryCode: regionNode.countryCode,
            subregions: regionNode.subregions || [],
          }
        }),
        languages: node.languages.map((lang: any) => ({
          code: lang.locale,
          name: lang.name,
          primary: lang.primary,
        })),
      }
    })
  } catch (error) {
    console.error("Error fetching markets:", error)
    return []
  }
}

// Función para obtener la región de respaldo
export async function fetchBackupRegion() {
  try {
    const query = gql`
      query {
        shop {
          billingAddress {
            country
            countryCodeV2
            zip
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    return {
      country: data.shop.billingAddress?.country || "España",
      countryCode: data.shop.billingAddress?.countryCodeV2 || "ES",
      postalCode: data.shop.billingAddress?.zip || "28001",
    }
  } catch (error) {
    console.error("Error fetching backup region:", error)
    // Devolver valores predeterminados en caso de error
    return {
      country: "España",
      countryCode: "ES",
      postalCode: "28001",
    }
  }
}

// Función para obtener la presencia web de la tienda
export async function fetchWebPresence(): Promise<WebPresence> {
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
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    return {
      shopId: data.shop.id,
      shopName: data.shop.name,
      primaryDomain: data.shop.primaryDomain.url,
      domains: data.shop.domains.map((domain) => ({
        id: domain.id,
        url: domain.url,
        sslEnabled: domain.sslEnabled,
      })),
      myshopifyDomain: data.shop.myshopifyDomain,
    }
  } catch (error) {
    console.error("Error fetching web presence:", error)
    throw new Error(`Error al obtener la presencia web: ${error.message}`)
  }
}

// Función para guardar la configuración SEO
export async function saveSeoSettings(settings: SeoSettings): Promise<boolean> {
  try {
    // Implementar cuando sea necesario
    console.log("Guardando configuración SEO:", settings)
    return true
  } catch (error) {
    console.error("Error saving SEO settings:", error)
    throw new Error(`Error al guardar la configuración SEO: ${error.message}`)
  }
}
