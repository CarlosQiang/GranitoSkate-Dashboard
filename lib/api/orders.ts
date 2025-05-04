import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import { formatShopifyId } from "@/lib/shopify"

export async function fetchRecentOrders(limit = 5) {
  try {
    const query = gql`
      query GetOrders($first: Int!) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              fulfillmentStatus
              financialStatus
              totalPrice
              customer {
                firstName
                lastName
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

    if (!data?.orders?.edges) {
      throw new Error("No se pudieron obtener los pedidos")
    }

    return data.orders.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error(`Error al cargar pedidos recientes: ${(error as Error).message}`)
  }
}

export async function fetchOrderById(id) {
  try {
    const formattedId = formatShopifyId(id, "Order")

    const query = gql`
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          name
          processedAt
          fulfillmentStatus
          financialStatus
          totalPrice
          subtotalPrice
          totalShippingPrice
          totalTax
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
            country
            zip
          }
          lineItems(first: 50) {
            edges {
              node {
                title
                quantity
                originalTotalPrice
                variant {
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

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.order) {
      throw new Error("No se pudo obtener el pedido")
    }

    return data.order
  } catch (error) {
    console.error("Error fetching order by ID:", error)
    throw new Error(`Error al cargar el pedido: ${(error as Error).message}`)
  }
}
