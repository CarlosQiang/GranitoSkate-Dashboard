import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function checkShopifyConnection() {
  try {
    const query = gql`
      query {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            url
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.shop) {
      return {
        success: false,
        message: "No se pudo conectar con Shopify",
        details: "La respuesta no contiene información de la tienda",
      }
    }

    return {
      success: true,
      message: "Conexión exitosa con Shopify",
      shop: data.shop,
    }
  } catch (error) {
    console.error("Error checking Shopify connection:", error)
    return {
      success: false,
      message: "Error al conectar con Shopify",
      details: (error as Error).message,
    }
  }
}

export async function checkOrdersAPI() {
  try {
    const query = gql`
      query {
        orders(first: 1) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.orders || !data.orders.edges) {
      return {
        success: false,
        message: "No se pudo acceder a los pedidos",
        details: "La respuesta no contiene información de pedidos",
      }
    }

    return {
      success: true,
      message: "API de pedidos funcionando correctamente",
      orderCount: data.orders.edges.length,
    }
  } catch (error) {
    console.error("Error checking orders API:", error)
    return {
      success: false,
      message: "Error al acceder a los pedidos",
      details: (error as Error).message,
    }
  }
}

export async function checkCustomersAPI() {
  try {
    const query = gql`
      query {
        customers(first: 1) {
          edges {
            node {
              id
              displayName
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.customers || !data.customers.edges) {
      return {
        success: false,
        message: "No se pudo acceder a los clientes",
        details: "La respuesta no contiene información de clientes",
      }
    }

    return {
      success: true,
      message: "API de clientes funcionando correctamente",
      customerCount: data.customers.edges.length,
    }
  } catch (error) {
    console.error("Error checking customers API:", error)
    return {
      success: false,
      message: "Error al acceder a los clientes",
      details: (error as Error).message,
    }
  }
}

export async function checkPromotionsAPI() {
  try {
    const query = gql`
      query {
        priceRules(first: 1) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRules || !data.priceRules.edges) {
      return {
        success: false,
        message: "No se pudo acceder a las promociones",
        details: "La respuesta no contiene información de promociones",
      }
    }

    return {
      success: true,
      message: "API de promociones funcionando correctamente",
      promotionCount: data.priceRules.edges.length,
    }
  } catch (error) {
    console.error("Error checking promotions API:", error)
    return {
      success: false,
      message: "Error al acceder a las promociones",
      details: (error as Error).message,
    }
  }
}

export async function runAllChecks() {
  const connection = await checkShopifyConnection()
  const orders = await checkOrdersAPI()
  const customers = await checkCustomersAPI()
  const promotions = await checkPromotionsAPI()

  return {
    connection,
    orders,
    customers,
    promotions,
    allSuccessful: connection.success && orders.success && customers.success && promotions.success,
  }
}
