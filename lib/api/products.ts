import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import { formatShopifyId } from "@/lib/shopify"

export async function fetchRecentProducts(limit = 5) {
  try {
    const query = gql`
      query GetProducts($first: Int!) {
        products(first: $first, sortKey: CREATED_AT, reverse: true) {
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

    const variables = {
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.products?.edges) {
      throw new Error("No se pudieron obtener los productos")
    }

    return data.products.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching recent products:", error)
    throw new Error(`Error al cargar productos recientes: ${(error as Error).message}`)
  }
}

export async function fetchProducts(limit = 20) {
  return fetchRecentProducts(limit)
}

export async function fetchProductById(id) {
  try {
    const formattedId = formatShopifyId(id, "Product")

    const query = gql`
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          status
          totalInventory
          featuredImage {
            url
          }
          images(first: 10) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                inventoryQuantity
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
      throw new Error("No se pudo obtener el producto")
    }

    return data.product
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    throw new Error(`Error al cargar el producto: ${(error as Error).message}`)
  }
}

export async function createProduct(productData) {
  try {
    const mutation = gql`
      mutation productCreate($input: ProductInput!) {
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

    const variables = {
      input: productData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.productCreate?.userErrors?.length > 0) {
      throw new Error(data.productCreate.userErrors[0].message)
    }

    return data.productCreate.product
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error(`Error al crear el producto: ${(error as Error).message}`)
  }
}

export async function updateProduct(id, productData) {
  try {
    const formattedId = formatShopifyId(id, "Product")

    const mutation = gql`
      mutation productUpdate($input: ProductInput!) {
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

    const variables = {
      input: {
        id: formattedId,
        ...productData,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return data.productUpdate.product
  } catch (error) {
    console.error("Error updating product:", error)
    throw new Error(`Error al actualizar el producto: ${(error as Error).message}`)
  }
}

export async function deleteProduct(id) {
  try {
    const formattedId = formatShopifyId(id, "Product")

    const mutation = gql`
      mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
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

    if (data?.productDelete?.userErrors?.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    return { success: true, id: data.productDelete.deletedProductId }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw new Error(`Error al eliminar el producto: ${(error as Error).message}`)
  }
}
