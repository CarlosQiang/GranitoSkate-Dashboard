import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { MetafieldInput, LocalBusinessData, SocialMediaData, SeoMetafields } from "@/types/metafields"

// Función para obtener metafields de un recurso
export async function getMetafields(ownerId: string, ownerType: string, namespace?: string) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = ownerId.includes("gid://shopify/")
    let formattedId = ownerId

    // Si no es un ID completo, formatearlo según el tipo de propietario
    if (!isFullShopifyId) {
      switch (ownerType) {
        case "PRODUCT":
          formattedId = `gid://shopify/Product/${ownerId}`
          break
        case "COLLECTION":
          formattedId = `gid://shopify/Collection/${ownerId}`
          break
        case "SHOP":
          formattedId = `gid://shopify/Shop/${ownerId}`
          break
        default:
          throw new Error(`Tipo de propietario no soportado: ${ownerType}`)
      }
    }

    // Construir la consulta GraphQL según el tipo de propietario
    let query = ""
    const variables: any = { namespace }

    if (ownerType === "COLLECTION") {
      query = gql`
        query GetCollectionMetafields($id: ID!, $namespace: String) {
          collection(id: $id) {
            metafields(first: 100, namespace: $namespace) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `
      variables.id = formattedId
    } else if (ownerType === "PRODUCT") {
      query = gql`
        query GetProductMetafields($id: ID!, $namespace: String) {
          product(id: $id) {
            metafields(first: 100, namespace: $namespace) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `
      variables.id = formattedId
    } else if (ownerType === "SHOP") {
      query = gql`
        query GetShopMetafields($namespace: String) {
          shop {
            metafields(first: 100, namespace: $namespace) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `
    } else {
      throw new Error(`Tipo de propietario no soportado: ${ownerType}`)
    }

    const data = await shopifyClient.request(query, variables)

    // Extraer los metafields según el tipo de propietario
    let metafieldEdges = []
    if (ownerType === "COLLECTION" && data.collection) {
      metafieldEdges = data.collection.metafields.edges
    } else if (ownerType === "PRODUCT" && data.product) {
      metafieldEdges = data.product.metafields.edges
    } else if (ownerType === "SHOP" && data.shop) {
      metafieldEdges = data.shop.metafields.edges
    } else {
      console.warn(`No se encontraron metafields para ${ownerType} con ID ${ownerId}`)
      return []
    }

    return metafieldEdges.map((edge) => ({
      id: edge.node.id,
      namespace: edge.node.namespace,
      key: edge.node.key,
      value: edge.node.value,
      type: edge.node.type,
      ownerType,
      ownerId,
      createdAt: edge.node.createdAt,
      updatedAt: edge.node.updatedAt,
    }))
  } catch (error) {
    console.error(`Error fetching metafields for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al obtener metafields: ${error.message}`)
  }
}

// Función para obtener un metafield específico
export async function getMetafield(ownerId: string, ownerType: string, namespace: string, key: string) {
  try {
    const metafields = await getMetafields(ownerId, ownerType, namespace)
    return metafields.find((metafield) => metafield.namespace === namespace && metafield.key === key) || null
  } catch (error) {
    console.error(`Error fetching specific metafield for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al obtener metafield específico: ${error.message}`)
  }
}

// Función para establecer un metafield
export async function setMetafield(
  ownerId: string,
  ownerType: string,
  metafield: {
    namespace: string
    key: string
    value: string
    type: string
  },
) {
  const mutation = gql`
    mutation MetafieldSet($input: MetafieldInput!) {
      metafieldSet(metafield: $input) {
        metafield {
          id
          namespace
          key
          value
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = ownerId.includes("gid://shopify/")
    let formattedId = ownerId

    // Si no es un ID completo, formatearlo según el tipo de propietario
    if (!isFullShopifyId) {
      switch (ownerType) {
        case "PRODUCT":
          formattedId = `gid://shopify/Product/${ownerId}`
          break
        case "COLLECTION":
          formattedId = `gid://shopify/Collection/${ownerId}`
          break
        case "SHOP":
          formattedId = `gid://shopify/Shop/${ownerId}`
          break
        default:
          throw new Error(`Tipo de propietario no soportado: ${ownerType}`)
      }
    }

    const input = {
      ownerId: formattedId,
      namespace: metafield.namespace,
      key: metafield.key,
      value: metafield.value,
      type: metafield.type,
    }

    const data = await shopifyClient.request(mutation, { input })

    if (data.metafieldSet.userErrors && data.metafieldSet.userErrors.length > 0) {
      throw new Error(data.metafieldSet.userErrors[0].message)
    }

    return data.metafieldSet.metafield
  } catch (error) {
    console.error(`Error setting metafield for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al establecer metafield: ${error.message}`)
  }
}

// Función para eliminar un metafield
export async function deleteMetafield(metafieldId: string) {
  const mutation = gql`
    mutation MetafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = metafieldId.includes("gid://shopify/Metafield/")
    const formattedId = isFullShopifyId ? metafieldId : `gid://shopify/Metafield/${metafieldId}`

    const data = await shopifyClient.request(mutation, {
      input: {
        id: formattedId,
      },
    })

    if (data.metafieldDelete.userErrors && data.metafieldDelete.userErrors.length > 0) {
      throw new Error(data.metafieldDelete.userErrors[0].message)
    }

    return data.metafieldDelete.deletedId
  } catch (error) {
    console.error(`Error deleting metafield ${metafieldId}:`, error)
    throw new Error(`Error al eliminar metafield: ${error.message}`)
  }
}

// Función para establecer múltiples metafields para SEO
export async function setSeoMetafields(ownerId: string, ownerType: string, metafields: MetafieldInput[]) {
  try {
    const metafieldPromises = metafields.map((metafield) =>
      setMetafield(ownerId, ownerType, {
        namespace: metafield.namespace,
        key: metafield.key,
        value: metafield.value,
        type: metafield.type || "single_line_text_field",
      }),
    )

    return await Promise.all(metafieldPromises)
  } catch (error) {
    console.error(`Error setting multiple metafields for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al establecer múltiples metafields: ${error.message}`)
  }
}

// Exportar otras funciones necesarias para la aplicación
export async function fetchSeoMetafields(ownerId: string, ownerType: string): Promise<SeoMetafields> {
  try {
    const metafields = await getMetafields(ownerId, ownerType)
    const seoMetafields = metafields.filter((metafield) => metafield.namespace === "seo")

    const result: SeoMetafields = {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }

    seoMetafields.forEach((metafield) => {
      switch (metafield.key) {
        case "title":
          result.title = metafield.value
          break
        case "description":
          result.description = metafield.value
          break
        case "keywords":
          try {
            result.keywords = JSON.parse(metafield.value)
          } catch (e) {
            result.keywords = metafield.value.split(",").map((k) => k.trim())
          }
          break
        case "og_title":
          result.ogTitle = metafield.value
          break
        case "og_description":
          result.ogDescription = metafield.value
          break
        case "og_image":
          result.ogImage = metafield.value
          break
        case "twitter_title":
          result.twitterTitle = metafield.value
          break
        case "twitter_description":
          result.twitterDescription = metafield.value
          break
        case "twitter_image":
          result.twitterImage = metafield.value
          break
        case "canonical_url":
          result.canonicalUrl = metafield.value
          break
      }
    })

    return result
  } catch (error) {
    console.error(`Error fetching SEO metafields for ${ownerType} ${ownerId}:`, error)
    return {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }
  }
}

export async function saveSeoMetafields(ownerId: string, ownerType: string, seoData: SeoMetafields): Promise<boolean> {
  try {
    const metafieldPromises = []

    if (seoData.title !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, {
          namespace: "seo",
          key: "title",
          value: seoData.title,
          type: "single_line_text_field",
        }),
      )
    }

    if (seoData.description !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, {
          namespace: "seo",
          key: "description",
          value: seoData.description,
          type: "multi_line_text_field",
        }),
      )
    }

    if (seoData.keywords !== undefined) {
      const keywordsValue =
        typeof seoData.keywords === "string"
          ? seoData.keywords
          : Array.isArray(seoData.keywords)
            ? JSON.stringify(seoData.keywords)
            : ""
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, {
          namespace: "seo",
          key: "keywords",
          value: keywordsValue,
          type: "json",
        }),
      )
    }

    await Promise.all(metafieldPromises)
    return true
  } catch (error) {
    console.error(`Error saving SEO metafields for ${ownerType} ${ownerId}:`, error)
    return false
  }
}

// Exportar otras funciones necesarias
export async function fetchLocalBusinessMetafields(shopId: string): Promise<any> {
  try {
    const metafields = await getMetafields(shopId, "SHOP", "local_business")
    const localBusinessData: LocalBusinessData = {}

    metafields.forEach((metafield) => {
      switch (metafield.key) {
        case "name":
          localBusinessData.name = metafield.value
          break
        case "street_address":
          localBusinessData.address = localBusinessData.address || {}
          localBusinessData.address.streetAddress = metafield.value
          break
        case "address_locality":
          localBusinessData.address = localBusinessData.address || {}
          localBusinessData.address.addressLocality = metafield.value
          break
        case "address_region":
          localBusinessData.address = localBusinessData.address || {}
          localBusinessData.address.addressRegion = metafield.value
          break
        case "postal_code":
          localBusinessData.address = localBusinessData.address || {}
          localBusinessData.address.postalCode = metafield.value
          break
        case "address_country":
          localBusinessData.address = localBusinessData.address || {}
          localBusinessData.address.addressCountry = metafield.value
          break
        case "telephone":
          localBusinessData.telephone = metafield.value
          break
        case "email":
          localBusinessData.email = metafield.value
          break
        case "opening_hours":
          localBusinessData.openingHours = metafield.value.split("\n")
          break
        case "latitude":
          localBusinessData.geo = localBusinessData.geo || {}
          localBusinessData.geo.latitude = metafield.value
          break
        case "longitude":
          localBusinessData.geo = localBusinessData.geo || {}
          localBusinessData.geo.longitude = metafield.value
          break
      }
    })

    return localBusinessData
  } catch (error) {
    console.error(`Error fetching local business metafields for shop ${shopId}:`, error)
    return {}
  }
}

export async function fetchSocialMediaMetafields(shopId: string): Promise<SocialMediaData> {
  try {
    const metafields = await getMetafields(shopId, "SHOP", "social_media")
    const socialMediaData: SocialMediaData = {}

    metafields.forEach((metafield) => {
      switch (metafield.key) {
        case "facebook":
          socialMediaData.facebook = metafield.value
          break
        case "instagram":
          socialMediaData.instagram = metafield.value
          break
        case "twitter":
          socialMediaData.twitter = metafield.value
          break
        case "youtube":
          socialMediaData.youtube = metafield.value
          break
        case "pinterest":
          socialMediaData.pinterest = metafield.value
          break
        case "linkedin":
          socialMediaData.linkedin = metafield.value
          break
        case "tiktok":
          socialMediaData.tiktok = metafield.value
          break
      }
    })

    return socialMediaData
  } catch (error) {
    console.error(`Error fetching social media metafields for shop ${shopId}:`, error)
    return {}
  }
}

export async function saveLocalBusinessMetafields(shopId: string, data: LocalBusinessData): Promise<boolean> {
  try {
    const metafieldPromises = []

    if (data.name) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", {
          namespace: "local_business",
          key: "name",
          value: data.name,
          type: "single_line_text_field",
        }),
      )
    }

    if (data.address) {
      if (data.address.streetAddress) {
        metafieldPromises.push(
          setMetafield(shopId, "SHOP", {
            namespace: "local_business",
            key: "street_address",
            value: data.address.streetAddress,
            type: "single_line_text_field",
          }),
        )
      }
      // Añadir otros campos de dirección...
    }

    await Promise.all(metafieldPromises)
    return true
  } catch (error) {
    console.error(`Error saving local business metafields for shop ${shopId}:`, error)
    return false
  }
}

export async function saveSocialMediaMetafields(shopId: string, data: SocialMediaData): Promise<boolean> {
  try {
    const metafieldPromises = []

    if (data.facebook) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", {
          namespace: "social_media",
          key: "facebook",
          value: data.facebook,
          type: "single_line_text_field",
        }),
      )
    }

    if (data.instagram) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", {
          namespace: "social_media",
          key: "instagram",
          value: data.instagram,
          type: "single_line_text_field",
        }),
      )
    }

    // Añadir otras redes sociales...

    await Promise.all(metafieldPromises)
    return true
  } catch (error) {
    console.error(`Error saving social media metafields for shop ${shopId}:`, error)
    return false
  }
}
