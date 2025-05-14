import shopifyClient, { formatShopifyId } from "@/lib/shopify"
import type { MetafieldDefinition, Metafield, SeoSettings, LocalBusinessInfo, SocialMediaProfiles } from "@/types/seo"
import { gql } from "graphql-request"

// Función para obtener todas las definiciones de metafields
export async function getMetafieldDefinitions(ownerType?: string): Promise<MetafieldDefinition[]> {
  try {
    const query = gql`
      query GetMetafieldDefinitions($ownerType: MetafieldOwnerType) {
        metafieldDefinitions(first: 100, ownerType: $ownerType) {
          edges {
            node {
              id
              name
              namespace
              key
              description
              ownerType
              type {
                name
              }
              validations {
                name
                value
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { ownerType })

    if (!data || !data.metafieldDefinitions || !data.metafieldDefinitions.edges) {
      console.error("Respuesta de definiciones de metafields incompleta:", data)
      return []
    }

    return data.metafieldDefinitions.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      namespace: edge.node.namespace,
      key: edge.node.key,
      description: edge.node.description,
      ownerType: edge.node.ownerType,
      type: edge.node.type.name,
      validations: edge.node.validations?.reduce((acc: any, validation: any) => {
        acc[validation.name] = validation.value
        return acc
      }, {}),
    }))
  } catch (error: any) {
    console.error("Error fetching metafield definitions:", error)
    return []
  }
}

// Función para crear una definición de metafield
export async function createMetafieldDefinition(
  definition: Partial<MetafieldDefinition>,
): Promise<MetafieldDefinition | null> {
  try {
    const mutation = gql`
      mutation CreateMetafieldDefinition($input: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $input) {
          metafieldDefinition {
            id
            name
            namespace
            key
            description
            ownerType
            type {
              name
            }
            validations {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        name: definition.name,
        namespace: definition.namespace,
        key: definition.key,
        description: definition.description,
        ownerType: definition.ownerType,
        type: definition.type,
        validations: definition.validations
          ? Object.entries(definition.validations).map(([name, value]) => ({
              name,
              value: String(value),
            }))
          : [],
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldDefinitionCreate.userErrors && data.metafieldDefinitionCreate.userErrors.length > 0) {
      console.error("Error creating metafield definition:", data.metafieldDefinitionCreate.userErrors)
      return null
    }

    const node = data.metafieldDefinitionCreate.metafieldDefinition
    return {
      id: node.id,
      name: node.name,
      namespace: node.namespace,
      key: node.key,
      description: node.description,
      ownerType: node.ownerType,
      type: node.type.name,
      validations: node.validations?.reduce((acc: any, validation: any) => {
        acc[validation.name] = validation.value
        return acc
      }, {}),
    }
  } catch (error) {
    console.error("Error creating metafield definition:", error)
    return null
  }
}

// Modificar la función getMetafields para incluir mejor manejo de errores
export async function getMetafields(ownerId: string, ownerType: string, namespace?: string): Promise<Metafield[]> {
  try {
    // Verificar que ownerId y ownerType no sean undefined
    if (!ownerId || !ownerType) {
      console.error("ownerId o ownerType son undefined:", { ownerId, ownerType })
      return []
    }

    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = ownerId.includes("gid://shopify/") ? ownerId : `gid://shopify/${ownerType}/${ownerId}`

    // Construir la consulta GraphQL según el tipo de propietario
    let query = ""

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

    // Preparar variables según el tipo de propietario
    const variables: any = { namespace }
    if (ownerType !== "SHOP") {
      variables.id = formattedId
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

    return metafieldEdges.map((edge: any) => ({
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
  } catch (error: any) {
    console.error(`Error fetching metafields for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al obtener metafields: ${error.message}`)
  }
}

// Función para crear o actualizar un metafield
export async function setMetafield(
  ownerId: string,
  ownerType: string,
  metafield: Partial<Metafield>,
): Promise<Metafield | null> {
  try {
    // Verificar que ownerId y ownerType no sean undefined
    if (!ownerId || !ownerType) {
      console.error("ownerId o ownerType son undefined:", { ownerId, ownerType })
      return null
    }

    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = ownerId.includes("gid://shopify/") ? ownerId : `gid://shopify/${ownerType}/${ownerId}`

    // Usar la mutación correcta según la versión actual de la API de Shopify
    const mutation = gql`
      mutation MetafieldCreate($input: MetafieldInput!) {
        metafieldCreate(metafield: $input) {
          metafield {
            id
            namespace
            key
            value
            type
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        ownerId: formattedId,
        namespace: metafield.namespace,
        key: metafield.key,
        value: metafield.value,
        type: metafield.type,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldCreate.userErrors && data.metafieldCreate.userErrors.length > 0) {
      console.error("Error setting metafield:", data.metafieldCreate.userErrors)
      return null
    }

    const node = data.metafieldCreate.metafield
    return {
      id: node.id,
      namespace: node.namespace,
      key: node.key,
      value: node.value,
      type: node.type,
      ownerType,
      ownerId,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    }
  } catch (error) {
    console.error("Error setting metafield:", error)
    return null
  }
}

// Función para eliminar un metafield
export async function deleteMetafield(id: string): Promise<boolean> {
  try {
    const mutation = gql`
      mutation DeleteMetafield($input: MetafieldDeleteInput!) {
        metafieldDelete(input: $input) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldDelete.userErrors && data.metafieldDelete.userErrors.length > 0) {
      console.error("Error deleting metafield:", data.metafieldDelete.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting metafield:", error)
    return false
  }
}

// Funciones específicas para SEO

// Obtener configuración SEO de la tienda
export async function getShopSeoSettings(): Promise<SeoSettings | null> {
  try {
    const metafields = await getMetafields("1", "SHOP", "seo")

    if (!metafields.length) {
      return {
        title: "",
        description: "",
        keywords: [],
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        twitterCard: "summary_large_image",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        canonicalUrl: "",
        marketTitle: "",
        marketDescription: "",
        marketKeywords: [],
        targetCountries: [],
      }
    }

    const seoMetafield = metafields.find((m) => m.key === "settings")

    if (!seoMetafield) {
      return {
        title: "",
        description: "",
        keywords: [],
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        twitterCard: "summary_large_image",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        canonicalUrl: "",
        marketTitle: "",
        marketDescription: "",
        marketKeywords: [],
        targetCountries: [],
      }
    }

    try {
      const seoSettings = JSON.parse(seoMetafield.value)
      return {
        ...seoSettings,
        keywords: seoSettings.keywords || [],
        marketTitle: seoSettings.marketTitle || "",
        marketDescription: seoSettings.marketDescription || "",
        marketKeywords: seoSettings.marketKeywords || [],
        targetCountries: seoSettings.targetCountries || [],
      }
    } catch (e) {
      console.error("Error parsing SEO settings:", e)
      return {
        title: "",
        description: "",
        keywords: [],
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        twitterCard: "summary_large_image",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        canonicalUrl: "",
        marketTitle: "",
        marketDescription: "",
        marketKeywords: [],
        targetCountries: [],
      }
    }
  } catch (error) {
    console.error("Error getting shop SEO settings:", error)
    return {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
      marketTitle: "",
      marketDescription: "",
      marketKeywords: [],
      targetCountries: [],
    }
  }
}

// Guardar configuración SEO de la tienda
export async function saveShopSeoSettings(settings: SeoSettings): Promise<boolean> {
  try {
    // Intentar guardar cada metafield individualmente
    const metafields = [
      {
        namespace: "seo",
        key: "title",
        value: settings.title || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "description",
        value: settings.description || "",
        type: "multi_line_text_field",
      },
      {
        namespace: "seo",
        key: "keywords",
        value: JSON.stringify(settings.keywords || []),
        type: "json",
      },
      {
        namespace: "seo",
        key: "marketTitle",
        value: settings.marketTitle || "",
        type: "single_line_text_field",
      },
      {
        namespace: "seo",
        key: "marketDescription",
        value: settings.marketDescription || "",
        type: "multi_line_text_field",
      },
      {
        namespace: "seo",
        key: "marketKeywords",
        value: JSON.stringify(settings.marketKeywords || []),
        type: "json",
      },
      {
        namespace: "seo",
        key: "targetCountries",
        value: JSON.stringify(settings.targetCountries || []),
        type: "json",
      },
    ]

    // Guardar cada metafield individualmente
    const results = await Promise.all(
      metafields.map(async (metafield) => {
        try {
          const result = await setMetafield("1", "SHOP", metafield)
          return !!result
        } catch (error) {
          console.error(`Error saving metafield ${metafield.key}:`, error)
          return false
        }
      }),
    )

    // Si todos los metafields se guardaron correctamente
    return results.every((result) => result)
  } catch (error) {
    console.error("Error saving shop SEO settings:", error)
    return false
  }
}

// Obtener información de negocio local
export async function getLocalBusinessInfo(): Promise<LocalBusinessInfo | null> {
  try {
    const metafields = await getMetafields("1", "SHOP", "local_business")

    if (!metafields.length) {
      return {
        name: "",
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "",
        telephone: "",
        email: "",
        openingHours: [],
        latitude: 0,
        longitude: 0,
      }
    }

    const infoMetafield = metafields.find((m) => m.key === "info")

    if (!infoMetafield) {
      return {
        name: "",
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "",
        telephone: "",
        email: "",
        openingHours: [],
        latitude: 0,
        longitude: 0,
      }
    }

    try {
      return JSON.parse(infoMetafield.value)
    } catch (e) {
      console.error("Error parsing local business info:", e)
      return {
        name: "",
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "",
        telephone: "",
        email: "",
        openingHours: [],
        latitude: 0,
        longitude: 0,
      }
    }
  } catch (error) {
    console.error("Error getting local business info:", error)
    return {
      name: "",
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "",
      telephone: "",
      email: "",
      openingHours: [],
      latitude: 0,
      longitude: 0,
    }
  }
}

// Guardar información de negocio local
export async function saveLocalBusinessInfo(info: LocalBusinessInfo): Promise<boolean> {
  try {
    const result = await setMetafield("1", "SHOP", {
      namespace: "local_business",
      key: "info",
      value: JSON.stringify(info),
      type: "json",
    })

    return !!result
  } catch (error) {
    console.error("Error saving local business info:", error)
    return false
  }
}

// Obtener perfiles de redes sociales
export async function getSocialMediaProfiles(): Promise<SocialMediaProfiles | null> {
  try {
    const metafields = await getMetafields("1", "SHOP", "social_media")

    if (!metafields.length) {
      return {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        tiktok: "",
      }
    }

    const profilesMetafield = metafields.find((m) => m.key === "profiles")

    if (!profilesMetafield) {
      return {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        tiktok: "",
      }
    }

    try {
      return JSON.parse(profilesMetafield.value)
    } catch (e) {
      console.error("Error parsing social media profiles:", e)
      return {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        tiktok: "",
      }
    }
  } catch (error) {
    console.error("Error getting social media profiles:", error)
    return {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
      tiktok: "",
    }
  }
}

// Guardar perfiles de redes sociales
export async function saveSocialMediaProfiles(profiles: SocialMediaProfiles): Promise<boolean> {
  try {
    const result = await setMetafield("1", "SHOP", {
      namespace: "social_media",
      key: "profiles",
      value: JSON.stringify(profiles),
      type: "json",
    })

    return !!result
  } catch (error) {
    console.error("Error saving social media profiles:", error)
    return false
  }
}

// Obtener configuración SEO de un producto
export async function getProductSeoSettings(productId: string): Promise<SeoSettings | null> {
  try {
    if (!productId) {
      console.error("productId es undefined")
      return null
    }

    const metafields = await getMetafields(productId, "PRODUCT", "seo")

    if (!metafields.length) {
      return null
    }

    const seoMetafield = metafields.find((m) => m.key === "settings")

    if (!seoMetafield) {
      return null
    }

    try {
      return JSON.parse(seoMetafield.value)
    } catch (e) {
      console.error("Error parsing product SEO settings:", e)
      return null
    }
  } catch (error) {
    console.error("Error getting product SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de un producto
export async function saveProductSeoSettings(productId: string, settings: SeoSettings): Promise<boolean> {
  try {
    if (!productId) {
      console.error("productId es undefined")
      return false
    }

    const result = await setMetafield(productId, "PRODUCT", {
      namespace: "seo",
      key: "settings",
      value: JSON.stringify(settings),
      type: "json",
    })

    return !!result
  } catch (error) {
    console.error("Error saving product SEO settings:", error)
    return false
  }
}

// Obtener configuración SEO de una colección
export async function getCollectionSeoSettings(collectionId: string): Promise<SeoSettings | null> {
  try {
    if (!collectionId) {
      console.error("collectionId es undefined")
      return null
    }

    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    console.log("Obteniendo configuración SEO para colección:", formattedId)

    // Consulta para obtener la información SEO de la colección
    const query = gql`
      query GetCollectionSEO($id: ID!) {
        collection(id: $id) {
          id
          title
          description
          seo {
            title
            description
          }
          metafields(first: 10, namespace: "seo") {
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

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data?.collection) {
      console.error("No se encontró la colección:", formattedId)
      return null
    }

    console.log("Datos SEO obtenidos:", data.collection)

    // Buscar el metafield de configuración SEO
    const seoMetafield = data.collection.metafields?.edges?.find((edge: any) => edge.node.key === "settings")

    // Si existe el metafield, devolver su valor
    if (seoMetafield) {
      try {
        const seoSettings = JSON.parse(seoMetafield.node.value)
        console.log("Configuración SEO encontrada en metafields:", seoSettings)
        return seoSettings
      } catch (e) {
        console.error("Error al parsear metafield SEO:", e)
      }
    }

    // Si no existe o hay error, crear un objeto con los valores por defecto
    console.log("Usando valores SEO por defecto")
    return {
      title: data.collection.seo?.title || data.collection.title,
      description: data.collection.seo?.description || data.collection.description,
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }
  } catch (error) {
    console.error("Error getting collection SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de una colección
export async function saveCollectionSeoSettings(collectionId: string, settings: SeoSettings): Promise<boolean> {
  try {
    if (!collectionId) {
      console.error("collectionId es undefined")
      return false
    }

    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    console.log("Guardando configuración SEO para colección:", formattedId)
    console.log("Datos a guardar:", settings)

    // Primero actualizamos los campos SEO básicos de la colección
    const updateMutation = gql`
      mutation UpdateCollectionSEO($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            seo {
              title
              description
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const updateVariables = {
      input: {
        id: formattedId,
        seo: {
          title: settings.title,
          description: settings.description,
        },
      },
    }

    console.log("Enviando actualización SEO básica:", updateVariables)
    const updateData = await shopifyClient.request(updateMutation, updateVariables)

    if (updateData.collectionUpdate.userErrors?.length > 0) {
      console.error("Error al actualizar SEO básico:", updateData.collectionUpdate.userErrors)
      throw new Error(updateData.collectionUpdate.userErrors[0].message)
    }

    // Luego guardamos la configuración completa como metafield usando la mutación correcta
    const metafieldMutation = gql`
      mutation CreateCollectionMetafield($input: MetafieldInput!) {
        metafieldCreate(metafield: $input) {
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

    const metafieldVariables = {
      input: {
        ownerId: formattedId,
        namespace: "seo",
        key: "settings",
        value: JSON.stringify(settings),
        type: "json",
      },
    }

    console.log("Enviando metafield:", metafieldVariables)

    const metafieldData = await shopifyClient.request(metafieldMutation, metafieldVariables)

    if (metafieldData.metafieldCreate.userErrors?.length > 0) {
      console.error("Error al guardar metafield SEO:", metafieldData.metafieldCreate.userErrors)
      throw new Error(metafieldData.metafieldCreate.userErrors[0].message)
    }

    console.log("Configuración SEO guardada correctamente:", metafieldData.metafieldCreate.metafield)
    return true
  } catch (error) {
    console.error("Error saving collection SEO settings:", error)
    return false
  }
}

export async function fetchProductSEO(productId) {
  try {
    if (!productId) {
      console.error("productId es undefined")
      return {
        title: "",
        description: "",
        metafields: [],
      }
    }

    const formattedId = formatShopifyId(productId, "Product")

    const query = gql`
      query GetProductSEO($id: ID!) {
        product(id: $id) {
          id
          title
          description
          seo {
            title
            description
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    `

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.product) {
      throw new Error("No se pudo obtener la información SEO del producto")
    }

    return {
      title: data.product.seo?.title || data.product.title,
      description: data.product.seo?.description || data.product.description,
      metafields: data.product.metafields?.edges?.map((edge) => edge.node) || [],
    }
  } catch (error: any) {
    console.error("Error fetching product SEO:", error)
    throw new Error(`Error al cargar la información SEO del producto: ${error.message}`)
  }
}

export async function updateProductSEO(productId, seoData) {
  try {
    if (!productId) {
      console.error("productId es undefined")
      return null
    }

    const formattedId = formatShopifyId(productId, "Product")

    const mutation = gql`
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            seo {
              title
              description
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: formattedId,
        seo: {
          title: seoData.title,
          description: seoData.description,
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return data.productUpdate.product
  } catch (error: any) {
    console.error("Error updating product SEO:", error)
    throw new Error(`Error al actualizar la información SEO del producto: ${error.message}`)
  }
}

export async function fetchCollectionSEO(collectionId) {
  try {
    if (!collectionId) {
      console.error("collectionId es undefined")
      return {
        title: "",
        description: "",
        metafields: [],
      }
    }

    const formattedId = formatShopifyId(collectionId, "Collection")

    const query = gql`
      query GetCollectionSEO($id: ID!) {
        collection(id: $id) {
          id
          title
          description
          seo {
            title
            description
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    `

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.collection) {
      throw new Error("No se pudo obtener la información SEO de la colección")
    }

    return {
      title: data.collection.seo?.title || data.collection.title,
      description: data.collection.seo?.description || data.collection.description,
      metafields: data.collection.metafields?.edges?.map((edge) => edge.node) || [],
    }
  } catch (error: any) {
    console.error("Error fetching collection SEO:", error)
    throw new Error(`Error al cargar la información SEO de la colección: ${error.message}`)
  }
}

export async function updateCollectionSEO(collectionId, seoData) {
  try {
    if (!collectionId) {
      console.error("collectionId es undefined")
      return null
    }

    const formattedId = formatShopifyId(collectionId, "Collection")

    const mutation = gql`
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            seo {
              title
              description
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: formattedId,
        seo: {
          title: seoData.title,
          description: seoData.description,
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.collectionUpdate?.userErrors?.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error: any) {
    console.error("Error updating collection SEO:", error)
    throw new Error(`Error al actualizar la información SEO de la colección: ${error.message}`)
  }
}

export async function fetchShopSEO() {
  try {
    const query = gql`
      query {
        shop {
          name
          description
          metafields(first: 20) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data?.shop) {
      throw new Error("No se pudo obtener la información SEO de la tienda")
    }

    return {
      name: data.shop.name,
      description: data.shop.description,
      metafields: data.shop.metafields?.edges?.map((edge) => edge.node) || [],
    }
  } catch (error: any) {
    console.error("Error fetching shop SEO:", error)
    throw new Error(`Error al cargar la información SEO de la tienda: ${error.message}`)
  }
}

// Función para obtener las definiciones de metafields para SEO
export async function fetchSeoMetafieldDefinitions(ownerType = "PRODUCT") {
  try {
    const query = gql`
      query GetMetafieldDefinitions($ownerType: MetafieldOwnerType!) {
        metafieldDefinitions(first: 50, ownerType: $ownerType) {
          edges {
            node {
              id
              name
              key
              namespace
              description
              ownerType
              validations {
                name
                value
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { ownerType })

    if (!data || !data.metafieldDefinitions || !data.metafieldDefinitions.edges) {
      console.error("Respuesta de definiciones de metafields incompleta:", data)
      return []
    }

    const definitions: MetafieldDefinition[] = data.metafieldDefinitions.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      key: edge.node.key,
      namespace: edge.node.namespace,
      description: edge.node.description,
      ownerType: edge.node.ownerType,
      validations: edge.node.validations,
    }))

    // Filtrar solo las definiciones relacionadas con SEO
    const seoDefinitions = definitions.filter(
      (def) => def.namespace === "seo" || def.key.includes("seo") || def.name.toLowerCase().includes("seo"),
    )

    return seoDefinitions
  } catch (error) {
    console.error("Error al cargar definiciones de metafields para SEO:", error)
    throw new Error(`Error al cargar definiciones de metafields para SEO: ${error.message}`)
  }
}

// Función para obtener los metafields de SEO de un producto o colección
export async function fetchSeoMetafields(id: string, type = "PRODUCT") {
  try {
    // Si el tipo es SHOP, usamos una consulta especial sin ID
    if (type === "SHOP") {
      const query = gql`
        query GetShopSeoMetafields {
          shop {
            metafields(first: 20) {
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

      if (!data || !data.shop || !data.shop.metafields) {
        console.error(`Respuesta de metafields incompleta para SHOP:`, data)
        return []
      }

      const metafields = data.shop.metafields.edges.map((edge: any) => ({
        id: edge.node.id,
        namespace: edge.node.namespace,
        key: edge.node.key,
        value: edge.node.value,
        type: edge.node.type,
      }))

      // Filtrar solo los metafields relacionados con SEO
      const seoMetafields = metafields.filter(
        (meta) =>
          meta.namespace === "seo" ||
          meta.key.includes("seo") ||
          (meta.namespace === "global" && meta.key === "description_tag"),
      )

      return seoMetafields
    } else {
      // Para productos y colecciones, usamos la consulta original con ID
      // Verificar que id no sea undefined
      if (!id) {
        console.error(`id es undefined para tipo ${type}`)
        return []
      }

      // Asegurarse de que el ID tenga el formato correcto
      const isFullId = id.includes("gid://shopify/")
      const resourceType = type === "PRODUCT" ? "Product" : "Collection"
      const formattedId = isFullId ? id : `gid://shopify/${resourceType}/${id}`

      const query = gql`
        query GetSeoMetafields($id: ID!) {
          ${type.toLowerCase()}(id: $id) {
            metafields(first: 20) {
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

      const data = await shopifyClient.request(query, { id: formattedId })

      if (!data || !data[type.toLowerCase()] || !data[type.toLowerCase()].metafields) {
        console.error(`Respuesta de metafields incompleta para ${type} ${id}:`, data)
        return []
      }

      const metafields = data[type.toLowerCase()].metafields.edges.map((edge: any) => ({
        id: edge.node.id,
        namespace: edge.node.namespace,
        key: edge.node.key,
        value: edge.node.value,
        type: edge.node.type,
      }))

      // Filtrar solo los metafields relacionados con SEO
      const seoMetafields = metafields.filter(
        (meta) =>
          meta.namespace === "seo" ||
          meta.key.includes("seo") ||
          (meta.namespace === "global" && meta.key === "description_tag"),
      )

      return seoMetafields
    }
  } catch (error) {
    console.error(`Error al cargar metafields de SEO para ${type} ${id}:`, error)
    throw new Error(`Error al cargar metafields de SEO: ${error.message}`)
  }
}

// Función para actualizar los metafields de SEO de un producto o colección
export async function updateSeoMetafields(id: string, metafields: any[], type = "PRODUCT") {
  try {
    // Verificar que id no sea undefined
    if (!id) {
      console.error(`id es undefined para tipo ${type}`)
      return {
        success: false,
        error: "ID no proporcionado",
      }
    }

    // Asegurarse de que el ID tenga el formato correcto
    const isFullId = id.includes("gid://shopify/")
    const resourceType = type === "PRODUCT" ? "Product" : "Collection"
    const formattedId = isFullId ? id : `gid://shopify/${resourceType}/${id}`

    // Usar la mutación metafieldCreate para cada metafield
    const results = await Promise.all(
      metafields.map(async (meta) => {
        const mutation = gql`
          mutation CreateMetafield($input: MetafieldInput!) {
            metafieldCreate(metafield: $input) {
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

        const variables = {
          input: {
            ownerId: formattedId,
            namespace: meta.namespace,
            key: meta.key,
            value: meta.value,
            type: meta.type,
          },
        }

        const data = await shopifyClient.request(mutation, variables)

        if (data.metafieldCreate.userErrors && data.metafieldCreate.userErrors.length > 0) {
          console.error(`Error al crear metafield ${meta.key}:`, data.metafieldCreate.userErrors)
          return {
            success: false,
            error: data.metafieldCreate.userErrors[0].message,
          }
        }

        return {
          success: true,
          id: data.metafieldCreate.metafield.id,
        }
      }),
    )

    const failures = results.filter((result) => !result.success)
    if (failures.length > 0) {
      throw new Error(`Error al actualizar ${failures.length} metafields: ${failures[0].error}`)
    }

    return {
      success: true,
      id: formattedId,
    }
  } catch (error) {
    console.error(`Error al actualizar metafields de SEO para ${type} ${id}:`, error)
    throw new Error(`Error al actualizar metafields de SEO: ${error.message}`)
  }
}
