import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCustomerOrders(customerId: string) {
  try {
    const query = gql`
      query GetCustomerOrders($customerId: ID!) {
        customer(id: $customerId) {
          orders(first: 50, sortKey: CREATED_AT, reverse: true) {
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

    const formattedCustomerId = `gid://shopify/Customer/${customerId}`

    const data = await shopifyClient.request(query, { customerId: formattedCustomerId })

    if (!data.customer || !data.customer.orders) {
      console.warn(`No se encontraron pedidos para el cliente con ID: ${customerId}`)
      return []
    }

    return data.customer.orders.edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      processedAt: node.processedAt,
      displayFulfillmentStatus: node.displayFulfillmentStatus,
      totalPrice: node.totalPriceSet.shopMoney.amount,
      currencyCode: node.totalPriceSet.shopMoney.currencyCode,
    }))
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error)
    throw new Error(`Error al cargar pedidos del cliente: ${error.message}`)
  }
}
