import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type {
  Metafield,
  MetafieldDefinition,
  Metaobject,
  MetaobjectDefinition,
  SeoMetafields,
  LocalBusinessMetafields,
  SocialMediaMetafields,
} from "@/types/metafields"

// Obtener definiciones de metafields para un tipo de propietario específico
export async function fetchMetafieldDefinitions(ownerType: string): Promise<MetafieldDefinition[]> {
  try {
    const query = gql`
      query GetMetafieldDefinitions($ownerType: MetafieldOwnerType!) {
        metafieldDefinitions(first: 100, ownerType: $ownerType) {
          edges {
            node {
              id
              name
              key
              namespace
              description
              type {
                name
              }
              validations {
                name
                value
              }
              ownerType
              visibleToStorefrontApi
              pinnedPosition
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
      key: edge.node.key,
      namespace: edge.node.namespace,
      description: edge.node.description,
      type: edge.node.type.name,
      validations: edge.node.validations,
      ownerType: edge.node.ownerType,
      visibleToStorefrontApi: edge.node.visibleToStorefrontApi,
      pinnedPosition: edge.node.pinnedPosition,
    }))
  } catch (error) {
    console.error("Error fetching metafield definitions:", error)
    return []
  }
}

// Crear una definición de metafield
export async function createMetafieldDefinition(
  definition: Partial<MetafieldDefinition>,
): Promise<MetafieldDefinition | null> {
  try {
    const mutation = gql`
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          metafieldDefinition {
            id
            name
            key
            namespace
            description
            type {
              name
            }
            ownerType
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      definition: {
        name: definition.name,
        namespace: definition.namespace,
        key: definition.key,
        description: definition.description,
        type: definition.type,
        ownerType: definition.ownerType,
        validations: definition.validations,
        visibleToStorefrontApi: definition.visibleToStorefrontApi || true,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldDefinitionCreate.userErrors && data.metafieldDefinitionCreate.userErrors.length > 0) {
      console.error("Error creating metafield definition:", data.metafieldDefinitionCreate.userErrors)
      return null
    }

    const result = data.metafieldDefinitionCreate.metafieldDefinition
    return {
      id: result.id,
      name: result.name,
      key: result.key,
      namespace: result.namespace,
      description: result.description,
      type: result.type.name,
      ownerType: result.ownerType,
      visibleToStorefrontApi: result.visibleToStorefrontApi,
    }
  } catch (error) {
    console.error("Error creating metafield definition:", error)
    return null
  }
}

// Obtener metafields para un propietario específico
export async function fetchMetafields(ownerId: string, ownerType: string): Promise<Metafield[]> {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = ownerId.includes(`gid://shopify/${ownerType}/`)
    const formattedId = isFullShopifyId ? ownerId : `gid://shopify/${ownerType}/${ownerId}`

    const query = gql`
      query GetMetafields($ownerId: ID!) {
        node(id: $ownerId) {
          id
          ... on ${ownerType} {
            metafields(first: 100) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                  description
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { ownerId: formattedId })

    if (!data || !data.node || !data.node.metafields || !data.node.metafields.edges) {
      console.error("Respuesta de metafields incompleta:", data)
      return []
    }

    return data.node.metafields.edges.map((edge: any) => ({
      id: edge.node.id,
      namespace: edge.node.namespace,
      key: edge.node.key,
      value: edge.node.value,
      type: edge.node.type,
      description: edge.node.description,
      createdAt: edge.node.createdAt,
      updatedAt: edge.node.updatedAt,
      ownerType,
      ownerId,
    }))
  } catch (error) {
    console.error(`Error fetching metafields for ${ownerType} ${ownerId}:`, error)
    return []
  }
}

// Establecer un metafield
export async function setMetafield(
  ownerId: string,
  ownerType: string,
  namespace: string,
  key: string,
  value: string,
  type: string,
): Promise<Metafield | null> {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = ownerId.includes(`gid://shopify/${ownerType}/`)
    const formattedId = isFullShopifyId ? ownerId : `gid://shopify/${ownerType}/${ownerId}`

    const mutation = gql`
      mutation MetafieldSet($metafield: MetafieldInput!) {
        metafieldSet(metafield: $metafield) {
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
      metafield: {
        ownerId: formattedId,
        namespace,
        key,
        value,
        type,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldSet.userErrors && data.metafieldSet.userErrors.length > 0) {
      console.error("Error setting metafield:", data.metafieldSet.userErrors)
      return null
    }

    const result = data.metafieldSet.metafield
    return {
      id: result.id,
      namespace: result.namespace,
      key: result.key,
      value: result.value,
      type: result.type,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      ownerType,
      ownerId,
    }
  } catch (error) {
    console.error(`Error setting metafield for ${ownerType} ${ownerId}:`, error)
    return null
  }
}

// Eliminar un metafield
export async function deleteMetafield(id: string): Promise<boolean> {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Metafield/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Metafield/${id}`

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

    const variables = {
      input: {
        id: formattedId,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldDelete.userErrors && data.metafieldDelete.userErrors.length > 0) {
      console.error("Error deleting metafield:", data.metafieldDelete.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting metafield ${id}:`, error)
    return false
  }
}

// Obtener definiciones de metaobjects
export async function fetchMetaobjectDefinitions(): Promise<MetaobjectDefinition[]> {
  try {
    const query = gql`
      query {
        metaobjectDefinitions(first: 100) {
          edges {
            node {
              id
              name
              type
              fieldDefinitions {
                name
                key
                type {
                  name
                }
                required
                description
                validations {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.metaobjectDefinitions || !data.metaobjectDefinitions.edges) {
      console.error("Respuesta de definiciones de metaobjects incompleta:", data)
      return []
    }

    return data.metaobjectDefinitions.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      type: edge.node.type,
      fieldDefinitions: edge.node.fieldDefinitions.map((field: any) => ({
        name: field.name,
        key: field.key,
        type: field.type.name,
        required: field.required,
        description: field.description,
        validations: field.validations,
      })),
    }))
  } catch (error) {
    console.error("Error fetching metaobject definitions:", error)
    return []
  }
}

// Obtener metaobjects por tipo
export async function fetchMetaobjectsByType(type: string): Promise<Metaobject[]> {
  try {
    const query = gql`
      query GetMetaobjectsByType($type: String!) {
        metaobjects(type: $type, first: 100) {
          edges {
            node {
              id
              handle
              type
              fields {
                key
                value
                type
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { type })

    if (!data || !data.metaobjects || !data.metaobjects.edges) {
      console.error("Respuesta de metaobjects incompleta:", data)
      return []
    }

    return data.metaobjects.edges.map((edge: any) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      type: edge.node.type,
      fields: edge.node.fields.map((field: any) => ({
        key: field.key,
        value: field.value,
        type: field.type,
      })),
    }))
  } catch (error) {
    console.error(`Error fetching metaobjects of type ${type}:`, error)
    return []
  }
}

// Crear un metaobject
export async function createMetaobject(
  type: string,
  fields: { key: string; value: string }[],
): Promise<Metaobject | null> {
  try {
    const mutation = gql`
      mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            id
            handle
            type
            fields {
              key
              value
              type
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
      metaobject: {
        type,
        fields: fields.map((field) => ({
          key: field.key,
          value: field.value,
        })),
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metaobjectCreate.userErrors && data.metaobjectCreate.userErrors.length > 0) {
      console.error("Error creating metaobject:", data.metaobjectCreate.userErrors)
      return null
    }

    const result = data.metaobjectCreate.metaobject
    return {
      id: result.id,
      handle: result.handle,
      type: result.type,
      fields: result.fields.map((field: any) => ({
        key: field.key,
        value: field.value,
        type: field.type,
      })),
    }
  } catch (error) {
    console.error(`Error creating metaobject of type ${type}:`, error)
    return null
  }
}

// Actualizar un metaobject
export async function updateMetaobject(
  id: string,
  fields: { key: string; value: string }[],
): Promise<Metaobject | null> {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Metaobject/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Metaobject/${id}`

    const mutation = gql`
      mutation MetaobjectUpdate($id: ID!, $fields: [MetaobjectFieldInput!]!) {
        metaobjectUpdate(id: $id, fields: $fields) {
          metaobject {
            id
            handle
            type
            fields {
              key
              value
              type
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
      id: formattedId,
      fields: fields.map((field) => ({
        key: field.key,
        value: field.value,
      })),
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metaobjectUpdate.userErrors && data.metaobjectUpdate.userErrors.length > 0) {
      console.error("Error updating metaobject:", data.metaobjectUpdate.userErrors)
      return null
    }

    const result = data.metaobjectUpdate.metaobject
    return {
      id: result.id,
      handle: result.handle,
      type: result.type,
      fields: result.fields.map((field: any) => ({
        key: field.key,
        value: field.value,
        type: field.type,
      })),
    }
  } catch (error) {
    console.error(`Error updating metaobject ${id}:`, error)
    return null
  }
}

// Eliminar un metaobject
export async function deleteMetaobject(id: string): Promise<boolean> {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Metaobject/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Metaobject/${id}`

    const mutation = gql`
      mutation MetaobjectDelete($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metaobjectDelete.userErrors && data.metaobjectDelete.userErrors.length > 0) {
      console.error("Error deleting metaobject:", data.metaobjectDelete.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting metaobject ${id}:`, error)
    return false
  }
}

// Funciones específicas para SEO

// Obtener metafields de SEO para un propietario específico
export async function fetchSeoMetafields(ownerId: string, ownerType: string): Promise<SeoMetafields> {
  try {
    const metafields = await fetchMetafields(ownerId, ownerType)

    // Filtrar metafields por namespace "seo"
    const seoMetafields = metafields.filter((metafield) => metafield.namespace === "seo")

    // Construir objeto de SEO
    const seo: SeoMetafields = {
      title: "",
      description: "",
      keywords: [],
    }

    // Rellenar con valores de metafields
    seoMetafields.forEach((metafield) => {
      switch (metafield.key) {
        case "title":
          seo.title = metafield.value
          break
        case "description":
          seo.description = metafield.value
          break
        case "keywords":
          try {
            seo.keywords = JSON.parse(metafield.value)
          } catch (e) {
            seo.keywords = metafield.value.split(",").map((k) => k.trim())
          }
          break
        case "og_title":
          seo.ogTitle = metafield.value
          break
        case "og_description":
          seo.ogDescription = metafield.value
          break
        case "og_image":
          seo.ogImage = metafield.value
          break
        case "twitter_title":
          seo.twitterTitle = metafield.value
          break
        case "twitter_description":
          seo.twitterDescription = metafield.value
          break
        case "twitter_image":
          seo.twitterImage = metafield.value
          break
        case "canonical_url":
          seo.canonicalUrl = metafield.value
          break
        case "structured_data":
          seo.structuredData = metafield.value
          break
      }
    })

    return seo
  } catch (error) {
    console.error(`Error fetching SEO metafields for ${ownerType} ${ownerId}:`, error)
    return {
      title: "",
      description: "",
      keywords: [],
    }
  }
}

// Guardar metafields de SEO para un propietario específico
export async function saveSeoMetafields(ownerId: string, ownerType: string, seo: SeoMetafields): Promise<boolean> {
  try {
    const metafieldPromises = []

    // Título SEO
    if (seo.title !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "title", seo.title, "single_line_text_field"))
    }

    // Descripción SEO
    if (seo.description !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "description", seo.description, "multi_line_text_field"),
      )
    }

    // Palabras clave
    if (seo.keywords !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "keywords", JSON.stringify(seo.keywords), "json"))
    }

    // Open Graph
    if (seo.ogTitle !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "og_title", seo.ogTitle, "single_line_text_field"))
    }

    if (seo.ogDescription !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "og_description", seo.ogDescription, "multi_line_text_field"),
      )
    }

    if (seo.ogImage !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "og_image", seo.ogImage, "url"))
    }

    // Twitter
    if (seo.twitterTitle !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "twitter_title", seo.twitterTitle, "single_line_text_field"),
      )
    }

    if (seo.twitterDescription !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "twitter_description", seo.twitterDescription, "multi_line_text_field"),
      )
    }

    if (seo.twitterImage !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "twitter_image", seo.twitterImage, "url"))
    }

    // URL canónica
    if (seo.canonicalUrl !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "canonical_url", seo.canonicalUrl, "url"))
    }

    // Datos estructurados
    if (seo.structuredData !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "structured_data", seo.structuredData, "json"))
    }

    // Ejecutar todas las promesas
    await Promise.all(metafieldPromises)

    return true
  } catch (error) {
    console.error(`Error saving SEO metafields for ${ownerType} ${ownerId}:`, error)
    return false
  }
}

// Obtener metafields de negocio local
export async function fetchLocalBusinessMetafields(shopId = "1"): Promise<LocalBusinessMetafields> {
  try {
    const metafields = await fetchMetafields(shopId, "SHOP")

    // Filtrar metafields por namespace "local_business"
    const localBusinessMetafields = metafields.filter((metafield) => metafield.namespace === "local_business")

    // Construir objeto de negocio local
    const localBusiness: LocalBusinessMetafields = {
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

    // Rellenar con valores de metafields
    localBusinessMetafields.forEach((metafield) => {
      switch (metafield.key) {
        case "name":
          localBusiness.name = metafield.value
          break
        case "street_address":
          localBusiness.streetAddress = metafield.value
          break
        case "address_locality":
          localBusiness.addressLocality = metafield.value
          break
        case "address_region":
          localBusiness.addressRegion = metafield.value
          break
        case "postal_code":
          localBusiness.postalCode = metafield.value
          break
        case "address_country":
          localBusiness.addressCountry = metafield.value
          break
        case "telephone":
          localBusiness.telephone = metafield.value
          break
        case "email":
          localBusiness.email = metafield.value
          break
        case "opening_hours":
          try {
            localBusiness.openingHours = JSON.parse(metafield.value)
          } catch (e) {
            localBusiness.openingHours = metafield.value.split(",").map((h) => h.trim())
          }
          break
        case "latitude":
          localBusiness.latitude = Number.parseFloat(metafield.value)
          break
        case "longitude":
          localBusiness.longitude = Number.parseFloat(metafield.value)
          break
      }
    })

    return localBusiness
  } catch (error) {
    console.error(`Error fetching local business metafields:`, error)
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

// Guardar metafields de negocio local
export async function saveLocalBusinessMetafields(
  shopId = "1",
  localBusiness: LocalBusinessMetafields,
): Promise<boolean> {
  try {
    const metafieldPromises = []

    // Nombre del negocio
    if (localBusiness.name !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "name", localBusiness.name, "single_line_text_field")  "SHOP\", \"local_business", "name", localBusiness.name, "single_line_text_field")
      )
    }

    // Dirección
    if (localBusiness.streetAddress !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "street_address",
          localBusiness.streetAddress,
          "single_line_text_field",
        ),
      )
    }

    if (localBusiness.addressLocality !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "address_locality",
          localBusiness.addressLocality,
          "single_line_text_field",
        ),
      )
    }

    if (localBusiness.addressRegion !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "address_region",
          localBusiness.addressRegion,
          "single_line_text_field",
        ),
      )
    }

    if (localBusiness.postalCode !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "postal_code",
          localBusiness.postalCode,
          "single_line_text_field",
        ),
      )
    }

    if (localBusiness.addressCountry !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "address_country",
          localBusiness.addressCountry,
          "single_line_text_field",
        ),
      )
    }

    // Contacto
    if (localBusiness.telephone !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "telephone", localBusiness.telephone, "single_line_text_field"),
      )
    }

    if (localBusiness.email !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "email", localBusiness.email, "single_line_text_field"),
      )
    }

    // Horarios
    if (localBusiness.openingHours !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "opening_hours",
          JSON.stringify(localBusiness.openingHours),
          "json",
        ),
      )
    }

    // Coordenadas
    if (localBusiness.latitude !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "latitude", localBusiness.latitude.toString(), "number_decimal"),
      )
    }

    if (localBusiness.longitude !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "longitude",
          localBusiness.longitude.toString(),
          "number_decimal",
        ),
      )
    }

    // Ejecutar todas las promesas
    await Promise.all(metafieldPromises)

    return true
  } catch (error) {
    console.error(`Error saving local business metafields:`, error)
    return false
  }
}

// Obtener metafields de redes sociales
export async function fetchSocialMediaMetafields(shopId = "1"): Promise<SocialMediaMetafields> {
  try {
    const metafields = await fetchMetafields(shopId, "SHOP")

    // Filtrar metafields por namespace "social_media"
    const socialMediaMetafields = metafields.filter((metafield) => metafield.namespace === "social_media")

    // Construir objeto de redes sociales
    const socialMedia: SocialMediaMetafields = {}

    // Rellenar con valores de metafields
    socialMediaMetafields.forEach((metafield) => {
      switch (metafield.key) {
        case "facebook":
          socialMedia.facebook = metafield.value
          break
        case "instagram":
          socialMedia.instagram = metafield.value
          break
        case "twitter":
          socialMedia.twitter = metafield.value
          break
        case "youtube":
          socialMedia.youtube = metafield.value
          break
        case "pinterest":
          socialMedia.pinterest = metafield.value
          break
        case "linkedin":
          socialMedia.linkedin = metafield.value
          break
        case "tiktok":
          socialMedia.tiktok = metafield.value
          break
      }
    })

    return socialMedia
  } catch (error) {
    console.error(`Error fetching social media metafields:`, error)
    return {}
  }
}

// Guardar metafields de redes sociales
export async function saveSocialMediaMetafields(shopId = "1", socialMedia: SocialMediaMetafields): Promise<boolean> {
  try {
    const metafieldPromises = []

    // Facebook
    if (socialMedia.facebook !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "facebook", socialMedia.facebook, "url"))
    }

    // Instagram
    if (socialMedia.instagram !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "instagram", socialMedia.instagram, "url"))
    }

    // Twitter
    if (socialMedia.twitter !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "twitter", socialMedia.twitter, "url"))
    }

    // YouTube
    if (socialMedia.youtube !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "youtube", socialMedia.youtube, "url"))
    }

    // Pinterest
    if (socialMedia.pinterest !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "pinterest", socialMedia.pinterest, "url"))
    }

    // LinkedIn
    if (socialMedia.linkedin !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "linkedin", socialMedia.linkedin, "url"))
    }

    // TikTok
    if (socialMedia.tiktok !== undefined) {
      metafieldPromises.push(setMetafield(shopId, "SHOP", "social_media", "tiktok", socialMedia.tiktok, "url"))
    }

    // Ejecutar todas las promesas
    await Promise.all(metafieldPromises)

    return true
  } catch (error) {
    console.error(`Error saving social media metafields:`, error)
    return false
  }
}
