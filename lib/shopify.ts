import { shopifyClient } from "./shopify-client"

export async function getShopifyStats() {
  try {
    const query = `
      query getShopStats {
        products(first: 1) {
          pageInfo {
            hasNextPage
          }
        }
        productsCount
        collections(first: 1) {
          pageInfo {
            hasNextPage
          }
        }
        collectionsCount
        customers(first: 1) {
          pageInfo {
            hasNextPage
          }
        }
        customersCount
        orders(first: 1) {
          pageInfo {
            hasNextPage
          }
        }
        ordersCount
      }
    `

    const response = await shopifyClient.request(query)

    return {
      productsCount: response.productsCount || 0,
      collectionsCount: response.collectionsCount || 0,
      customersCount: response.customersCount || 0,
      ordersCount: response.ordersCount || 0,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas de Shopify:", error)
    return {
      productsCount: 0,
      collectionsCount: 0,
      customersCount: 0,
      ordersCount: 0,
    }
  }
}

export async function getProducts() {
  try {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              status
              totalInventory
              updatedAt
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
            }
          }
        }
      }
    `

    const variables = {
      first: 20,
    }

    const response = await shopifyClient.request(query, variables)

    return response.products.edges.map((edge: any) => {
      const product = edge.node
      return {
        id: product.id.split("/").pop(),
        title: product.title,
        handle: product.handle,
        status: product.status,
        totalInventory: product.totalInventory,
        updatedAt: product.updatedAt,
        featuredImage: product.featuredImage,
        priceRange: product.priceRange,
      }
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return []
  }
}

export async function getCollections() {
  try {
    const query = `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              productsCount
              updatedAt
              image {
                url
                altText
              }
            }
          }
        }
      }
    `

    const variables = {
      first: 20,
    }

    const response = await shopifyClient.request(query, variables)

    return response.collections.edges.map((edge: any) => {
      const collection = edge.node
      return {
        id: collection.id.split("/").pop(),
        title: collection.title,
        handle: collection.handle,
        productsCount: collection.productsCount,
        updatedAt: collection.updatedAt,
        image: collection.image,
      }
    })
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return []
  }
}

export async function getCustomers() {
  try {
    const query = `
      query getCustomers($first: Int!) {
        customers(first: $first) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              ordersCount
              totalSpent {
                amount
                currencyCode
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    const variables = {
      first: 20,
    }

    const response = await shopifyClient.request(query, variables)

    return response.customers.edges.map((edge: any) => {
      const customer = edge.node
      return {
        id: customer.id.split("/").pop(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        ordersCount: customer.ordersCount,
        totalSpent: customer.totalSpent,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return []
  }
}

export async function getOrders() {
  try {
    const query = `
      query getOrders($first: Int!) {
        orders(first: $first) {
          edges {
            node {
              id
              name
              customer {
                id
                firstName
                lastName
                email
              }
              totalPrice {
                amount
                currencyCode
              }
              processedAt
              fulfillmentStatus
              financialStatus
            }
          }
        }
      }
    `

    const variables = {
      first: 20,
    }

    const response = await shopifyClient.request(query, variables)

    return response.orders.edges.map((edge: any) => {
      const order = edge.node
      return {
        id: order.id.split("/").pop(),
        name: order.name,
        customer: order.customer,
        totalPrice: order.totalPrice,
        processedAt: order.processedAt,
        fulfillmentStatus: order.fulfillmentStatus,
        financialStatus: order.financialStatus,
      }
    })
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return []
  }
}
