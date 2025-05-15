"use server"

import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function updateCollection(id: string, collectionData: any) {
  try {
    const mutation = gql`
      mutation collectionUpdate($input: CollectionInput!) {
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
        descriptionHtml: collectionData.descriptionHtml,
        metafields: collectionData.metafields,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error) {
    console.error(`Error al actualizar la colección con ID ${id}:`, error)
    throw new Error(`Error al actualizar la colección: ${error.message}`)
  }
}

export async function deleteCollection(id: string): Promise<string> {
  try {
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
        id: id,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionDelete.userErrors.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return data.collectionDelete.deletedCollectionId
  } catch (error) {
    console.error(`Error al eliminar la colección con ID ${id}:`, error)
    throw new Error(`Error al eliminar la colección: ${error.message}`)
  }
}
