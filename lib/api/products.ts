import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todos los productos
export async function fetchProducts(limit = 50, cursor = null) {
  try {
    const query = gql`
      query GetProducts($limit: Int!, $cursor: String) {
        products(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              productType
              tags
              vendor
              status
              createdAt
              updatedAt
              publishedAt
              totalInventory
              onlineStoreUrl
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    inventoryQuantity
                    sku
                  }
                }
              }
              collections(first: 5) {
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
      limit,
      cursor,
    }

    const data = await shopifyClient.request(query, variables)
    return data.products
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error(`Error al cargar productos: ${error.message}`)
  }
}

// Función para obtener un producto por ID
export async function fetchProductById(id) {
  try {
    const query = gql`
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
          vendor
          status
          createdAt
          updatedAt
          publishedAt
          totalInventory
          onlineStoreUrl
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
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
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                inventoryQuantity
                sku
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)
    return data.product
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error)
    throw new Error(`Error al cargar el producto: ${error.message}`)
  }
}

// Función para crear un nuevo producto
export async function createProduct(productData) {
  try {
    const mutation = gql`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
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
      input: productData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.productCreate.userErrors.length > 0) {
      throw new Error(data.productCreate.userErrors[0].message)
    }

    return data.productCreate.product
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error(`Error al crear el producto: ${error.message}`)
  }
}

// Función para actualizar un producto existente
export async function updateProduct(id, productData) {
  try {
    const mutation = gql`
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
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
        id,
        ...productData,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.productUpdate.userErrors.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return data.productUpdate.product
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error)
    throw new Error(`Error al actualizar el producto: ${error.message}`)
  }
}

// Función para eliminar un producto
export async function deleteProduct(id) {
  try {
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
        id,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.productDelete.userErrors.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    return data.productDelete.deletedProductId
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error)
    throw new Error(`Error al eliminar el producto: ${error.message}`)
  }
}

// Función para buscar productos
export async function searchProducts(query, limit = 20) {
  try {
    const gqlQuery = gql`
      query SearchProducts($query: String!, $limit: Int!) {
        products(query: $query, first: $limit) {
          edges {
            node {
              id
              title
              handle
              productType
              vendor
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      query,
      limit,
    }

    const data = await shopifyClient.request(gqlQuery, variables)
    return data.products.edges.map((edge) => edge.node)
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error)
    throw new Error(`Error al buscar productos: ${error.message}`)
  }
}
