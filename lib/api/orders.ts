import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentOrders(limit = 10) {
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

    if (!data || !data.orders || !data.orders.edges) {
      console.warn("No se encontraron pedidos o la respuesta está incompleta")
      return []
    }

    return data.orders.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      displayFulfillmentStatus: edge.node.displayFulfillmentStatus,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
      currencyCode: edge.node.totalPriceSet.shopMoney.currencyCode,
      customer: edge.node.customer,
      items: [], // Placeholder for items
    }))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error(`Error al obtener pedidos recientes: ${error.message}`)
  }
}

export async function fetchOrderById(id: string) {
  try {
    const query = gql`
      query GetOrder($id: ID!) {
        order(id: $id) {
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
            email
          }
          shippingAddress {
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          lineItems(first: 10) {
            edges {
              node {
                title
                quantity
                price
                productId
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id })

    if (!data || !data.order) {
      throw new Error(`Pedido no encontrado: ${id}`)
    }

    return {
      id: data.order.id,
      name: data.order.name,
      processedAt: data.order.processedAt,
      displayFulfillmentStatus: data.order.displayFulfillmentStatus,
      totalPrice: data.order.totalPriceSet.shopMoney.amount,
      currencyCode: data.order.totalPriceSet.shopMoney.currencyCode,
      customer: data.order.customer,
      shippingAddress: data.order.shippingAddress,
      items: data.order.lineItems.edges.map((edge) => edge.node),
      subtotalPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
    }
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error)
    throw new Error(`Error al cargar el pedido: ${error.message}`)
  }
}
