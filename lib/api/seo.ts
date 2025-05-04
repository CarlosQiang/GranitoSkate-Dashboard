import shopifyClient, { formatShopifyId } from "@/lib/shopify"
import type {
  MetafieldDefinition,
  Metafield,
  MetaobjectDefinition,
  Metaobject,
  SeoSettings,
  LocalBusinessInfo,
  SocialMediaProfiles,
  StructuredDataConfig,
} from "@/types/seo"
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
      console.error("Respuesta de definiciones de metafields incompleta:",  {\
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
  } catch (error) 
    console.error("Error fetching metafield definitions:", error)
    return []
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
      console.error(
        "Error creating metafield definition:",
        data.metafieldDefinitionCreate.userErrors,
      )
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
    const query = gql`
      query GetMetafields($ownerId: ID!, $ownerType: MetafieldOwnerType!, $namespace: String) {
        owner: ${ownerType.toLowerCase()}(id: $ownerId) {
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

    const variables = {
      ownerId,
      ownerType,
      namespace,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.owner?.metafields?.edges) {
      console.error("No metafields data found:", data)
      return []
    }

    return data.owner.metafields.edges.map((edge: any) => ({
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
    console.error("Error fetching metafields:", error)
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
    const mutation = gql`
      mutation SetMetafield($input: MetafieldsSetInput!) {
        metafieldsSet(metafields: $input) {
          metafields {
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
        ownerId,
        metafields: [
          {
            namespace: metafield.namespace,
            key: metafield.key,
            value: metafield.value,
            type: metafield.type,
          },
        ],
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metafieldsSet.userErrors && data.metafieldsSet.userErrors.length > 0) {
      console.error("Error setting metafield:", data.metafieldsSet.userErrors)
      return null
    }

    const node = data.metafieldsSet.metafields[0]
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

// Función para obtener todas las definiciones de metaobjects
export async function getMetaobjectDefinitions(): Promise<MetaobjectDefinition[]> {
  try {
    const query = gql`
      query GetMetaobjectDefinitions {
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
      })),
    }))
  } catch (error) {
    console.error("Error fetching metaobject definitions:", error)
    return []
  }
}

// Función para crear una definición de metaobject
export async function createMetaobjectDefinition(
  definition: Partial<MetaobjectDefinition>,
): Promise<MetaobjectDefinition | null> {
  try {
    const mutation = gql`
      mutation CreateMetaobjectDefinition($input: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $input) {
          metaobjectDefinition {
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
        type: definition.type,
        fieldDefinitions: definition.fieldDefinitions?.map((field) => ({
          name: field.name,
          key: field.key,
          type: field.type,
          required: field.required,
        })),
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metaobjectDefinitionCreate.userErrors && data.metaobjectDefinitionCreate.userErrors.length > 0) {
      console.error(
        "Error creating metaobject definition:",
        data.metaobjectDefinitionCreate.userErrors,
      )
      return null
    }

    const node = data.metaobjectDefinitionCreate.metaobjectDefinition
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      fieldDefinitions: node.fieldDefinitions.map((field: any) => ({
        name: field.name,
        key: field.key,
        type: field.type.name,
        required: field.required,
      })),
    }
  } catch (error) {
    console.error("Error creating metaobject definition:", error)
    return null
  }
}

// Función para obtener metaobjects por tipo
export async function getMetaobjects(type: string): Promise<Metaobject[]> {
  try {
    const query = gql`
      query GetMetaobjects($type: String!) {
        metaobjects(type: $type, first: 100) {
          edges {
            node {
              id
              type
              handle
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

    const variables = {
      type,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data || !data.metaobjects || !data.metaobjects.edges) {
      console.error("Respuesta de metaobjects incompleta:", data)
      return []
    }

    return data.metaobjects.edges.map((edge: any) => ({
      id: edge.node.id,
      type: edge.node.type,
      handle: edge.node.handle,
      fields: edge.node.fields.map((field: any) => ({
        key: field.key,
        value: field.value,
        type: field.type,
      })),
    }))
  } catch (error) {
    console.error("Error fetching metaobjects:", error)
    return []
  }
}

// Función para crear o actualizar un metaobject
export async function setMetaobject(
  type: string,
  handle: string,
  fields: { key: string; value: string; type: string }[],
): Promise<Metaobject | null> {
  try {
    const mutation = gql`
      mutation SetMetaobject($input: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $input) {
          metaobject {
            id
            type
            handle
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
      input: {
        type,
        handle,
        fields: fields.map((field) => ({
          key: field.key,
          value: field.value,
          type: field.type,
        })),
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.metaobjectCreate.userErrors && data.metaobjectCreate.userErrors.length > 0) {
      console.error("Error setting metaobject:", data.metaobjectCreate.userErrors)
      return null
    }

    const node = data.metaobjectCreate.metaobject
    return {
      id: node.id,
      type: node.type,
      handle: node.handle,
      fields: node.fields.map((field: any) => ({
        key: field.key,
        value: field.value,
        type: field.type,
      })),
    }
  } catch (error) {
    console.error("Error setting metaobject:", error)
    return null
  }
}

// Función para eliminar un metaobject
export async function deleteMetaobject(id: string): Promise<boolean> {
  try {
    const mutation = gql`
      mutation DeleteMetaobject($input: MetaobjectDeleteInput!) {
        metaobjectDelete(input: $input) {
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

    if (data.metaobjectDelete.userErrors && data.metaobjectDelete.userErrors.length > 0) {
      console.error("Error deleting metaobject:", data.metaobjectDelete.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting metaobject:", error)
    return false
  }
}

// Funciones específicas para SEO

// Obtener configuración SEO de la tienda
export async function getShopSeoSettings(): Promise<SeoSettings | null> {
  try {
    const metafields = await getMetafields("gid://shopify/Shop/1", "SHOP", "seo")

    if (!metafields.length) {
      return null
    }

    const seoMetafield = metafields.find((m) => m.key === "settings")

    if (!seoMetafield) {
      return null
    }

    return JSON.parse(seoMetafield.value)
  } catch (error) {
    console.error("Error getting shop SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de la tienda
export async function saveShopSeoSettings(settings: SeoSettings): Promise<boolean> {
  try {
    const result = await setMetafield("gid://shopify/Shop/1", "SHOP", {
      namespace: "seo",
      key: "settings",
      value: JSON.stringify(settings),
      type: "json",
    })

    return !!result
  } catch (error) {
    console.error("Error saving shop SEO settings:", error)
    return false
  }
}

// Obtener información de negocio local
export async function getLocalBusinessInfo(): Promise<LocalBusinessInfo | null> {
  try {
    const metafields = await getMetafields("gid://shopify/Shop/1", "SHOP", "local_business")

    if (!metafields.length) {
      return null
    }

    const infoMetafield = metafields.find((m) => m.key === "info")

    if (!infoMetafield) {
      return null
    }

    return JSON.parse(infoMetafield.value)
  } catch (error) {
    console.error("Error getting local business info:", error)
    return null
  }
}

// Guardar información de negocio local
export async function saveLocalBusinessInfo(info: LocalBusinessInfo): Promise<boolean> {
  try {
    const result = await setMetafield("gid://shopify/Shop/1", "SHOP", {
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
    const metafields = await getMetafields("gid://shopify/Shop/1", "SHOP", "social_media")

    if (!metafields.length) {
      return null
    }

    const profilesMetafield = metafields.find((m) => m.key === "profiles")

    if (!profilesMetafield) {
      return null
    }

    return JSON.parse(profilesMetafield.value)
  } catch (error) {
    console.error("Error getting social media profiles:", error)
    return null
  }
}

// Guardar perfiles de redes sociales
export async function saveSocialMediaProfiles(profiles: SocialMediaProfiles): Promise<boolean> {
  try {
    const result = await setMetafield("gid://shopify/Shop/1", "SHOP", {
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

// Obtener configuración de datos estructurados
export async function getStructuredDataConfig(): Promise<StructuredDataConfig | null> {
  try {
    const metafields = await getMetafields("gid://shopify/Shop/1", "SHOP", "structured_data")

    if (!metafields.length) {
      return null
    }

    const configMetafield = metafields.find((m) => m.key === "config")

    if (!configMetafield) {
      return null
    }

    return JSON.parse(configMetafield.value)
  } catch (error) {
    console.error("Error getting structured data config:", error)
    return null
  }
}

// Guardar configuración de datos estructurados
export async function saveStructuredDataConfig(config: StructuredDataConfig): Promise<boolean> {
  try {
    const result = await setMetafield("gid://shopify/Shop/1", "SHOP", {
      namespace: "structured_data",
      key: "config",
      value: JSON.stringify(config),
      type: "json",
    })

    return !!result
  } catch (error) {
    console.error("Error saving structured data config:", error)
    return false
  }
}

// Obtener configuración SEO de un producto
export async function getProductSeoSettings(productId: string): Promise<SeoSettings | null> {
  try {
    const metafields = await getMetafields(productId, "PRODUCT", "seo")

    if (!metafields.length) {
      return null
    }

    const seoMetafield = metafields.find((m) => m.key === "settings")

    if (!seoMetafield) {
      return null
    }

    return JSON.parse(seoMetafield.value)
  } catch (error) {
    console.error("Error getting product SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de un producto
export async function saveProductSeoSettings(productId: string, settings: SeoSettings): Promise<boolean> {
  try {
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
    const metafields = await getMetafields(collectionId, "COLLECTION", "seo")

    if (!metafields.length) {
      return null
    }

    const seoMetafield = metafields.find((m) => m.key === "settings")

    if (!seoMetafield) {
      return null
    }

    return JSON.parse(seoMetafield.value)
  } catch (error) {
    console.error("Error getting collection SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de una colección
export async function saveCollectionSeoSettings(collectionId: string, settings: SeoSettings): Promise<boolean> {
  try {
    const result = await setMetafield(collectionId, "COLLECTION", {
      namespace: "seo",
      key: "settings",
      value: JSON.stringify(settings),
      type: "json",
    })

    return !!result
  } catch (error) {
    console.error("Error saving collection SEO settings:", error)
    return false
  }
}

export async function fetchProductSEO(productId) {
  try {
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
