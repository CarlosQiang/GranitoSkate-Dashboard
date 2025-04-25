import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentProducts(limit = 5) {
  const query = gql`
    query GetRecentProducts($limit: Int!) {
      products(first: $limit, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            featuredImage {
              url
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { limit })

    return data.products.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      title: edge.node.title,
      handle: edge.node.handle,
      status: edge.node.status,
      totalInventory: edge.node.totalInventory,
      featuredImage: edge.node.featuredImage,
    }))
  } catch (error) {
    console.error("Error fetching recent products:", error)
    return []
  }
}

export async function fetchProductById(id: string) {
  const query = gql`
    query GetProductById($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        description
        descriptionHtml
        status
        totalInventory
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              inventoryQuantity
              sku
              selectedOptions {
                name
                value
              }
            }
          }
        }
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
        collections(first: 10) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { id: `gid://shopify/Product/${id}` })
    return data.product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw new Error(`Failed to fetch product ${id}`)
  }
}

export async function createProduct(productData: any) {
  const mutation = gql`
    mutation ProductCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
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

  try {
    const data = await shopifyClient.request(mutation, { input: productData })

    if (data.productCreate.userErrors.length > 0) {
      throw new Error(data.productCreate.userErrors[0].message)
    }

    return data.productCreate.product
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any) {
  const mutation = gql`
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
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

  try {
    const data = await shopifyClient.request(mutation, {
      input: {
        id: `gid://shopify/Product/${id}`,
        ...productData,
      },
    })

    if (data.productUpdate.userErrors.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return data.productUpdate.product
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  const mutation = gql`
    mutation ProductDelete($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      input: {
        id: `gid://shopify/Product/${id}`,
      },
    })

    if (data.productDelete.userErrors.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    return data.productDelete.deletedProductId
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}
