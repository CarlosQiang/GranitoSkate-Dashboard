import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentOrders(limit = 5) {
  try {
    const query = gql`
      query GetRecentOrders($first: Int!) {
        orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                firstName
                lastName
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { first: limit })

    return data.orders.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      displayFulfillmentStatus: edge.node.displayFulfillmentStatus,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
      currencyCode: edge.node.totalPriceSet.shopMoney.currencyCode,
      customer: {
        firstName: edge.node.customer?.firstName,
        lastName: edge.node.customer?.lastName,
      },
    }))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error(`Error al cargar pedidos recientes: ${error.message}`)
  }
}

export async function fetchCustomerOrders(customerId) {
  try {
    const query = gql`
      query GetCustomerOrders($customerId: ID!) {
        customer(id: $customerId) {
          orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                name
                processedAt
                displayFulfillmentStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { customerId: `gid://shopify/Customer/${customerId}` })

    if (!data.customer) {
      throw new Error("Cliente no encontrado")
    }

    return data.customer.orders.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      displayFulfillmentStatus: edge.node.displayFulfillmentStatus,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
      currencyCode: edge.node.totalPriceSet.shopMoney.currencyCode,
    }))
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    throw new Error(`Error al cargar pedidos del cliente: ${error.message}`)
  }
}
