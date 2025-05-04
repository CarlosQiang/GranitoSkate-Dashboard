import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCollections(limit = 20) {
  try {
    console.log(`Fetching up to ${limit} collections from Shopify...`)

    const query = gql`
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              productsCount
              image {
                url
                altText
              }
              products(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.collections?.edges) {
      throw new Error("Respuesta de colecciones incompleta")
    }

    const collections = data.collections.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        handle: node.handle,
        productsCount: node.productsCount,
        image: node.image?.url || null,
        products:
          node.products?.edges?.map((productEdge) => ({
            id: productEdge.node.id.split("/").pop(),
            title: productEdge.node.title,
          })) || [],
      }
    })

    console.log(`Successfully fetched ${collections.length} collections`)
    return collections
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al cargar colecciones: ${error.message}`)
  }
}

export async function fetchCollectionById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    console.log(`Fetching collection with ID: ${formattedId}`)

    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          productsCount
          image {
            url
            altText
          }
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                totalInventory
                status
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
      throw new Error(`Colección no encontrada: ${id}`)
    }

    const collection = data.collection
    return {
      id: collection.id.split("/").pop(),
      title: collection.title,
      handle: collection.handle,
      description: collection.description,
      descriptionHtml: collection.descriptionHtml,
      productsCount: collection.productsCount,
      image: collection.image?.url || null,
      products:
        collection.products?.edges?.map((edge) => {
          const node = edge.node
          return {
            id: node.id.split("/").pop(),
            title: node.title,
            handle: node.handle,
            image: node.featuredImage?.url || null,
            price: node.priceRange?.minVariantPrice?.amount || "0.00",
            currencyCode: node.priceRange?.minVariantPrice?.currencyCode || "EUR",
            totalInventory: node.totalInventory || 0,
            status: node.status,
          }
        }) || [],
    }
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${error.message}`)
  }
}

export async function createCollection(collectionData) {
  try {
    const mutation = gql`
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            handle
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
        title: collectionData.title,
        descriptionHtml: collectionData.description || "",
        image: collectionData.image
          ? {
              alt: collectionData.title,
              src: collectionData.image,
            }
          : undefined,
        seo: {
          title: collectionData.seoTitle || collectionData.title,
          description: collectionData.seoDescription || collectionData.description || "",
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.collectionCreate?.userErrors?.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw new Error(`Error al crear la colección: ${error.message}`)
  }
}

export async function updateCollection(id, collectionData) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const mutation = gql`
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
            handle
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
        title: collectionData.title,
        descriptionHtml: collectionData.description || "",
        image: collectionData.image
          ? {
              alt: collectionData.title,
              src: collectionData.image,
            }
          : undefined,
        seo: {
          title: collectionData.seoTitle || collectionData.title,
          description: collectionData.seoDescription || collectionData.description || "",
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.collectionUpdate?.userErrors?.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error) {
    console.error(`Error updating collection ${id}:`, error)
    throw new Error(`Error al actualizar la colección: ${error.message}`)
  }
}

export async function deleteCollection(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const mutation = gql`
      mutation collectionDelete($input: CollectionDeleteInput!) {
        collectionDelete(input: $input) {
          deletedCollectionId
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

    if (data?.collectionDelete?.userErrors?.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return { success: true, id: data.collectionDelete.deletedCollectionId }
  } catch (error) {
    console.error(`Error deleting collection ${id}:`, error)
    throw new Error(`Error al eliminar la colección: ${error.message}`)
  }
}
