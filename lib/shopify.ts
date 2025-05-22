import { shopifyFetch } from "./shopify-client"

// Función para obtener productos de Shopify
export async function getShopifyProducts(limit = 10, cursor = null) {
  try {
    const query = `
      query getProducts($limit: Int!, $cursor: String) {
        products(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              handle
              productType
              vendor
              status
              publishedAt
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
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

    const response = await shopifyFetch({ query, variables })

    return {
      products: response.data.products.edges.map((edge) => edge.node),
      pageInfo: response.data.products.pageInfo,
    }
  } catch (error) {
    console.error("Error al obtener productos de Shopify:", error)
    throw error
  }
}

// Función para obtener colecciones de Shopify
export async function getShopifyCollections(limit = 10, cursor = null) {
  try {
    const query = `
      query getCollections($limit: Int!, $cursor: String) {
        collections(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
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
      limit,
      cursor,
    }

    const response = await shopifyFetch({ query, variables })

    return {
      collections: response.data.collections.edges.map((edge) => edge.node),
      pageInfo: response.data.collections.pageInfo,
    }
  } catch (error) {
    console.error("Error al obtener colecciones de Shopify:", error)
    throw error
  }
}

// Función para obtener clientes de Shopify
export async function getShopifyCustomers(limit = 10, cursor = null) {
  try {
    const query = `
      query getCustomers($limit: Int!, $cursor: String) {
        customers(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              tags
              acceptsMarketing
              ordersCount
              totalSpent
              defaultAddress {
                address1
                address2
                city
                province
                country
                zip
                phone
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

    const response = await shopifyFetch({ query, variables })

    return {
      customers: response.data.customers.edges.map((edge) => edge.node),
      pageInfo: response.data.customers.pageInfo,
    }
  } catch (error) {
    console.error("Error al obtener clientes de Shopify:", error)
    throw error
  }
}

// Función para obtener pedidos de Shopify
export async function getShopifyOrders(limit = 10, cursor = null) {
  try {
    const query = `
      query getOrders($limit: Int!, $cursor: String) {
        orders(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              email
              phone
              totalPrice
              subtotalPrice
              totalShippingPrice
              totalTax
              financialStatus
              fulfillmentStatus
              processedAt
              customer {
                id
                firstName
                lastName
                email
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      price
                      sku
                      product {
                        id
                        title
                      }
                    }
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

    const response = await shopifyFetch({ query, variables })

    return {
      orders: response.data.orders.edges.map((edge) => edge.node),
      pageInfo: response.data.orders.pageInfo,
    }
  } catch (error) {
    console.error("Error al obtener pedidos de Shopify:", error)
    throw error
  }
}

// Función para probar la conexión con Shopify
export async function testShopifyConnection() {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return {
        success: false,
        message: "Faltan credenciales de Shopify",
      }
    }

    // Intentar obtener información de la tienda para verificar la conexión
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: `Error al conectar con Shopify: ${response.status} ${response.statusText}`,
        details: errorText,
      }
    }

    const data = await response.json()

    return {
      success: true,
      message: "Conexión exitosa a Shopify",
      shop: {
        name: data.shop.name,
        email: data.shop.email,
        domain: data.shop.domain,
        country: data.shop.country_name,
        plan: data.shop.plan_name,
      },
    }
  } catch (error) {
    console.error("Error al probar la conexión a Shopify:", error)
    return {
      success: false,
      message: error.message || "Error desconocido al conectar con Shopify",
    }
  }
}

// Función para crear un producto en Shopify
export async function createShopifyProduct(productData) {
  try {
    const mutation = `
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

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.data.productCreate.userErrors.length > 0) {
      throw new Error(`Error al crear producto: ${response.data.productCreate.userErrors[0].message}`)
    }

    return response.data.productCreate.product
  } catch (error) {
    console.error("Error al crear producto en Shopify:", error)
    throw error
  }
}

// Función para actualizar un producto en Shopify
export async function updateShopifyProduct(id, productData) {
  try {
    const mutation = `
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
        id: `gid://shopify/Product/${id}`,
        ...productData,
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.data.productUpdate.userErrors.length > 0) {
      throw new Error(`Error al actualizar producto: ${response.data.productUpdate.userErrors[0].message}`)
    }

    return response.data.productUpdate.product
  } catch (error) {
    console.error("Error al actualizar producto en Shopify:", error)
    throw error
  }
}

// Función para eliminar un producto en Shopify
export async function deleteShopifyProduct(id) {
  try {
    const mutation = `
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
        id: `gid://shopify/Product/${id}`,
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.data.productDelete.userErrors.length > 0) {
      throw new Error(`Error al eliminar producto: ${response.data.productDelete.userErrors[0].message}`)
    }

    return response.data.productDelete.deletedProductId
  } catch (error) {
    console.error("Error al eliminar producto en Shopify:", error)
    throw error
  }
}

// Exportar todas las funciones
export default {
  getShopifyProducts,
  getShopifyCollections,
  getShopifyCustomers,
  getShopifyOrders,
  testShopifyConnection,
  createShopifyProduct,
  updateShopifyProduct,
  deleteShopifyProduct,
}
