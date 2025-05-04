import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function addProductsToCollection(collectionId, productIds) {
  try {
    const mutation = gql`
      mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const data = await shopifyClient.request(mutation, {
      id: collectionId,
      productIds: productIds,
    })

    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    return data.collectionAddProducts.collection
  } catch (error) {
    console.error("Error adding products to collection:", error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    const mutation = gql`
      mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const data = await shopifyClient.request(mutation, {
      id: collectionId,
      productIds: productIds,
    })

    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    return data.collectionRemoveProducts.collection
  } catch (error) {
    console.error("Error removing products from collection:", error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}

export async function deleteCollection(id) {
  try {
    const mutation = gql`
      mutation CollectionDelete($input: CollectionDeleteInput!) {
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
        id: id,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionDelete.userErrors && data.collectionDelete.userErrors.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return {
      id: data.collectionDelete.deletedCollectionId,
    }
  } catch (error) {
    console.error(`Error al eliminar la colección ${id}:`, error)
    throw new Error(`Error al eliminar la colección: ${error.message}`)
  }
}

export async function updateCollection(id, collectionData) {
  try {
    const mutation = gql`
      mutation CollectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
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
        id: id,
        title: collectionData.title,
        descriptionHtml: collectionData.description,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return {
      id: data.collectionUpdate.collection.id,
      title: data.collectionUpdate.collection.title,
    }
  } catch (error) {
    console.error(`Error al actualizar la colección ${id}:`, error)
    throw new Error(`Error al actualizar la colección: ${error.message}`)
  }
}

export async function createCollection(collectionData) {
  try {
    const mutation = gql`
      mutation CollectionCreate($input: CollectionInput!) {
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
        descriptionHtml: collectionData.descriptionHtml,
        handle: collectionData.handle,
        metafields: collectionData.metafields,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionCreate.userErrors && data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return {
      id: data.collectionCreate.collection.id,
      title: data.collectionCreate.collection.title,
      handle: data.collectionCreate.collection.handle,
    }
  } catch (error) {
    console.error("Error al crear la colección:", error)
    throw new Error(`Error al crear la colección: ${error.message}`)
  }
}
