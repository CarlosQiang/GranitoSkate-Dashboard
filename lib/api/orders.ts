import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentOrders(limit = 5) {
  const query = gql`
    query GetRecentOrders($limit: Int!) {
      orders(first: $limit, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            fulfillmentStatus
            financialStatus
            totalPrice {
              amount
              currencyCode
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

  try {
    const data = await shopifyClient.request(query, { limit })

    return data.orders.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      fulfillmentStatus: edge.node.fulfillmentStatus || "UNFULFILLED",
      financialStatus: edge.node.financialStatus,
      totalPrice: edge.node.totalPrice.amount,
      customer: edge.node.customer || { firstName: "Cliente", lastName: "Anónimo" },
    }))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return []
  }
}

export async function fetchOrderById(id: string) {
  const query = gql`
    query GetOrderById($id: ID!) {
      order(id: $id) {
        id
        name
        processedAt
        fulfillmentStatus
        financialStatus
        totalPrice {
          amount
          currencyCode
        }
        subtotalPrice {
          amount
          currencyCode
        }
        totalShippingPrice {
          amount
          currencyCode
        }
        totalTax {
          amount
          currencyCode
        }
        customer {
          firstName
          lastName
          email
          phone
        }
        shippingAddress {
          address1
          address2
          city
          province
          zip
          country
        }
        lineItems(first: 50) {
          edges {
            node {
              title
              quantity
              originalUnitPrice {
                amount
                currencyCode
              }
              discountedUnitPrice {
                amount
                currencyCode
              }
              variant {
                id
                title
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { id: `gid://shopify/Order/${id}` })
    return data.order
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error(`Failed to fetch order ${id}`)
  }
}
