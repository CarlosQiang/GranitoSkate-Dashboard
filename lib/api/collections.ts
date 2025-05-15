"use server"

import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCollections() {
  try {
    const query = gql`
      query {
        collections(first: 250) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              image {
                url
                altText
              }
              productsCount
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    return data.collections.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.descriptionHtml,
      image: {
        url: edge.node.image?.url || null,
        altText: edge.node.image?.altText || null,
      },
      productsCount: edge.node.productsCount || 0,
    }))
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
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
        descriptionHtml: collectionData.descriptionHtml,
        handle: collectionData.handle,
        metafields: collectionData.metafields,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw error
  }
}

export async function fetchCollectionById(id: string) {
  try {
    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          descriptionHtml
          image {
            url
            altText
          }
          productsCount
        }
      }
    `

    const variables = {
      id: `gid://shopify/Collection/${id}`,
    }

    const data = await shopifyClient.request(query, variables)

    return {
      id: data.collection.id,
      title: data.collection.title,
      handle: data.collection.handle,
      description: data.collection.descriptionHtml,
      image: data.collection.image,
      productsCount: data.collection.productsCount,
    }
  } catch (error) {
    console.error(`Error fetching collection with ID ${id}:`, error)
    return null
  }
}
