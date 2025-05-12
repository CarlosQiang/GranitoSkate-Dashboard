import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Market, WebPresence } from "@/types/markets"

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
          metafields(first: 20, namespace: "seo") {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Extraer metafields de SEO
    const seoMetafields = data.shop.metafields.edges.map((edge: any) => edge.node)

    // Buscar metafields específicos
    const titleMetafield = seoMetafields.find((m: any) => m.key === "title")
    const descriptionMetafield = seoMetafields.find((m: any) => m.key === "description")
    const keywordsMetafield = seoMetafields.find((m: any) => m.key === "keywords")
    const socialMediaMetafield = seoMetafields.find((m: any) => m.key === "social_media")
    const localBusinessMetafield = seoMetafields.find((m: any) => m.key === "local_business")

    // Construir objeto de presencia web
    const webPresence: WebPresence = {
      id: data.shop.id,
      url: data.shop.primaryDomain.url,
      shopName: data.shop.name,
      primaryDomain: data.shop.primaryDomain.url,
      domains: data.shop.domains.map((domain: any) => ({
        id: domain.id,
        url: domain.url,
        sslEnabled: domain.sslEnabled,
      })),
      myshopifyDomain: data.shop.myshopifyDomain,
      seo: {
        title: titleMetafield ? titleMetafield.value : data.shop.name,
        description: descriptionMetafield ? descriptionMetafield.value : "",
        keywords: keywordsMetafield ? JSON.parse(keywordsMetafield.value) : [],
      },
      socialMedia: socialMediaMetafield
        ? JSON.parse(socialMediaMetafield.value)
        : {
            facebook: "",
            instagram: "",
            twitter: "",
            youtube: "",
            pinterest: "",
          },
      localBusiness: localBusinessMetafield
        ? JSON.parse(localBusinessMetafield.value)
        : {
            name: data.shop.name,
            address: {
              streetAddress: "",
              addressLocality: "",
              addressRegion: "",
              postalCode: "",
              addressCountry: "ES",
            },
            telephone: "",
            email: "",
            openingHours: [],
            geo: {
              latitude: 0,
              longitude: 0,
            },
          },
    }

    return webPresence
  } catch (error) {
    console.error("Error fetching web presence:", error)

    // Devolver un objeto con valores predeterminados en caso de error
    return {
      id: "",
      url: "",
      shopName: "Mi Tienda",
      primaryDomain: "",
      domains: [],
      myshopifyDomain: "",
      seo: {
        title: "Mi Tienda",
        description: "",
        keywords: [],
      },
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        pinterest: "",
      },
      localBusiness: {
        name: "Mi Tienda",
        address: {
          streetAddress: "",
          addressLocality: "",
          addressRegion: "",
          postalCode: "",
          addressCountry: "ES",
        },
        telephone: "",
        email: "",
        openingHours: [],
        geo: {
          latitude: 0,
          longitude: 0,
        },
      },
    }
  }
}

// Función para guardar la configuración SEO
export async function saveSeoSettings(settings: WebPresence): Promise<boolean> {
  try {
    // Guardar metafields de SEO
    const mutations = []

    // Metafield para título SEO
    mutations.push(
      shopifyClient.request(
        gql`
          mutation SetMetafield($input: MetafieldInput!) {
            metafieldSet(metafield: $input) {
              metafield {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          input: {
            namespace: "seo",
            key: "title",
            value: settings.seo.title,
            type: "single_line_text_field",
            ownerId: "gid://shopify/Shop/1",
          },
        },
      ),
    )

    // Metafield para descripción SEO
    mutations.push(
      shopifyClient.request(
        gql`
          mutation SetMetafield($input: MetafieldInput!) {
            metafieldSet(metafield: $input) {
              metafield {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          input: {
            namespace: "seo",
            key: "description",
            value: settings.seo.description,
            type: "multi_line_text_field",
            ownerId: "gid://shopify/Shop/1",
          },
        },
      ),
    )

    // Metafield para palabras clave SEO
    mutations.push(
      shopifyClient.request(
        gql`
          mutation SetMetafield($input: MetafieldInput!) {
            metafieldSet(metafield: $input) {
              metafield {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          input: {
            namespace: "seo",
            key: "keywords",
            value: JSON.stringify(settings.seo.keywords),
            type: "json",
            ownerId: "gid://shopify/Shop/1",
          },
        },
      ),
    )

    // Metafield para redes sociales
    mutations.push(
      shopifyClient.request(
        gql`
          mutation SetMetafield($input: MetafieldInput!) {
            metafieldSet(metafield: $input) {
              metafield {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          input: {
            namespace: "seo",
            key: "social_media",
            value: JSON.stringify(settings.socialMedia),
            type: "json",
            ownerId: "gid://shopify/Shop/1",
          },
        },
      ),
    )

    // Metafield para negocio local
    mutations.push(
      shopifyClient.request(
        gql`
          mutation SetMetafield($input: MetafieldInput!) {
            metafieldSet(metafield: $input) {
              metafield {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          input: {
            namespace: "seo",
            key: "local_business",
            value: JSON.stringify(settings.localBusiness),
            type: "json",
            ownerId: "gid://shopify/Shop/1",
          },
        },
      ),
    )

    // Ejecutar todas las mutaciones
    await Promise.all(mutations)

    return true
  } catch (error) {
    console.error("Error saving SEO settings:", error)
    throw new Error(`Error al guardar la configuración SEO: ${error.message}`)
  }
}
