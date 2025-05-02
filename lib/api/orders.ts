import shopifyClient, { formatShopifyId } from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentOrders(limit = 5) {
  const query = gql`
    query {
      orders(first: ${limit}, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFulfillmentStatus
            displayFinancialStatus
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

  try {
    console.log("Fetching recent orders...")
    const data = await shopifyClient.request(query)
    console.log("Orders response received")

    if (!data || !data.orders || !data.orders.edges) {
      console.error("Respuesta de órdenes incompleta:", data)
      return []
    }

    return data.orders.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      name: edge.node.name,
      processedAt: edge.node.createdAt,
      fulfillmentStatus: edge.node.displayFulfillmentStatus || "UNFULFILLED",
      financialStatus: edge.node.displayFinancialStatus,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
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
        createdAt
        displayFulfillmentStatus
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalShippingPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
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
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              discountedUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
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
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = formatShopifyId(id, "Order")

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.order) {
      throw new Error(`Pedido no encontrado: ${id}`)
    }

    return data.order
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error(`Failed to fetch order ${id}`)
  }
}
