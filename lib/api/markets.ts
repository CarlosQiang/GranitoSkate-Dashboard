import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Market, MarketRegion, WebPresence } from "@/types/markets"

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

// Obtener la región de respaldo
export async function fetchBackupRegion(): Promise<MarketRegion | null> {
  try {
    const query = gql`
      query {
        backupRegion {
          id
          name
          countryCode
          subregions {
            code
            name
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data.backupRegion) return null

    return {
      id: data.backupRegion.id,
      name: data.backupRegion.name,
      countryCode: data.backupRegion.countryCode,
      subregions: data.backupRegion.subregions || [],
    }
  } catch (error) {
    console.error("Error fetching backup region:", error)
    return null
  }
}

// Obtener información de presencia web (para SEO)
export async function fetchWebPresence(): Promise<WebPresence | null> {
  try {
    const query = gql`
      query {
        shop {
          id
          url
          name
          metafields(first: 20, namespace: "seo") {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data.shop) return null

    // Extraer metafields relacionados con SEO
    const metafields = data.shop.metafields.edges.reduce((acc: any, edge: any) => {
      acc[edge.node.key] = edge.node.value
      return acc
    }, {})

    // Valores por defecto para la presencia web
    return {
      id: data.shop.id,
      url: data.shop.url,
      seo: {
        title: metafields.title || data.shop.name,
        description: metafields.description || "",
        keywords: metafields.keywords ? JSON.parse(metafields.keywords) : [],
      },
      socialMedia: {
        facebook: metafields.facebook || "",
        instagram: metafields.instagram || "",
        twitter: metafields.twitter || "",
        youtube: metafields.youtube || "",
        pinterest: metafields.pinterest || "",
      },
      localBusiness: {
        name: data.shop.name,
        address: {
          streetAddress: metafields.streetAddress || "",
          addressLocality: metafields.addressLocality || "",
          addressRegion: metafields.addressRegion || "",
          postalCode: metafields.postalCode || "",
          addressCountry: metafields.addressCountry || "",
        },
        telephone: metafields.telephone || "",
        email: metafields.email || "",
        openingHours: metafields.openingHours ? JSON.parse(metafields.openingHours) : [],
        geo: {
          latitude: metafields.latitude ? Number.parseFloat(metafields.latitude) : 0,
          longitude: metafields.longitude ? Number.parseFloat(metafields.longitude) : 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching web presence:", error)
    return null
  }
}

// Guardar configuración de SEO
export async function saveSeoSettings(settings: Partial<WebPresence>): Promise<boolean> {
  try {
    // Convertir la configuración a metafields
    const metafields = [
      {
        namespace: "seo",
        key: "title",
        value: settings.seo?.title || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "description",
        value: settings.seo?.description || "",
        type: "multi_line_text_field",
      },
      {
        namespace: "seo",
        key: "keywords",
        value: JSON.stringify(settings.seo?.keywords || []),
        type: "json",
      },
      // Social media
      {
        namespace: "seo",
        key: "facebook",
        value: settings.socialMedia?.facebook || "",
        type: "url",
      },
      {
        namespace: "seo",
        key: "instagram",
        value: settings.socialMedia?.instagram || "",
        type: "url",
      },
      {
        namespace: "seo",
        key: "twitter",
        value: settings.socialMedia?.twitter || "",
        type: "url",
      },
      {
        namespace: "seo",
        key: "youtube",
        value: settings.socialMedia?.youtube || "",
        type: "url",
      },
      {
        namespace: "seo",
        key: "pinterest",
        value: settings.socialMedia?.pinterest || "",
        type: "url",
      },
      // Local business
      {
        namespace: "seo",
        key: "streetAddress",
        value: settings.localBusiness?.address?.streetAddress || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "addressLocality",
        value: settings.localBusiness?.address?.addressLocality || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "addressRegion",
        value: settings.localBusiness?.address?.addressRegion || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "postalCode",
        value: settings.localBusiness?.address?.postalCode || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "addressCountry",
        value: settings.localBusiness?.address?.addressCountry || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "telephone",
        value: settings.localBusiness?.telephone || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "email",
        value: settings.localBusiness?.email || "",
        type: "email",
      },
      {
        namespace: "seo",
        key: "openingHours",
        value: JSON.stringify(settings.localBusiness?.openingHours || []),
        type: "json",
      },
      {
        namespace: "seo",
        key: "latitude",
        value: settings.localBusiness?.geo?.latitude?.toString() || "0",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "longitude",
        value: settings.localBusiness?.geo?.longitude?.toString() || "0",
        type: "single_line_text_field",
      },
    ]

    // Crear la mutación para actualizar los metafields
    const mutation = gql`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      metafields: metafields.map((metafield) => ({
        ...metafield,
        ownerId: "gid://shopify/Shop/1", // ID genérico de la tienda
      })),
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldsSet.userErrors.length > 0) {
      console.error("Error saving SEO settings:", data.metafieldsSet.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error("Error saving SEO settings:", error)
    return false
  }
}
