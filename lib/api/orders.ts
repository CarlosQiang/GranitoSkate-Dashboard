import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todos los pedidos
export async function fetchOrders(limit = 50, cursor = null, query = "") {
  try {
    const gqlQuery = gql`
      query GetOrders($limit: Int!, $cursor: String, $query: String) {
        orders(first: $limit, after: $cursor, query: $query, sortKey: CREATED_AT, reverse: true) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                firstName
                lastName
                email
                phone
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              shippingAddress {
                address1
                address2
                city
                province
                zip
                country
              }
            }
          }
        }
      }
    `

    const variables = {
      limit,
      cursor,
      query,
    }

    const data = await shopifyClient.request(gqlQuery, variables)
    return data.orders
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error(`Error al cargar pedidos: ${error.message}`)
  }
}

// Función para obtener un pedido por ID
export async function fetchOrderById(id) {
  try {
    const query = gql`
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
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
            id
            firstName
            lastName
            email
            phone
            defaultAddress {
              address1
              address2
              city
              province
              zip
              country
            }
          }
          shippingAddress {
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                originalTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                discountedTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                variant {
                  id
                  title
                  sku
                  product {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
          discountApplications(first: 10) {
            edges {
              node {
                targetType
                value {
                  ... on MoneyV2 {
                    amount
                    currencyCode
                  }
                  ... on PricingPercentageValue {
                    percentage
                  }
                }
                ... on DiscountCodeApplication {
                  code
                }
              }
            }
          }
          note
          tags
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)
    return data.order
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error)
    throw new Error(`Error al cargar el pedido: ${error.message}`)
  }
}

// Función para obtener estadísticas de pedidos
export async function fetchOrderStats(days = 30) {
  try {
    const query = gql`
      query GetOrderStats($days: Int!) {
        orders(first: 1, query: "created_at:>=${days}d") {
          edges {
            node {
              id
            }
          }
        }
        shop {
          ordersCount
          totalSales
          currencyCode
        }
      }
    `

    const variables = {
      days,
    }

    const data = await shopifyClient.request(query, variables)

    // Obtener el recuento de pedidos recientes
    const recentOrdersQuery = gql`
      query GetRecentOrdersCount($days: Int!) {
        orders(query: "created_at:>=${days}d") {
          edges {
            node {
              id
            }
          }
        }
      }
    `

    const recentOrdersData = await shopifyClient.request(recentOrdersQuery, variables)
    const recentOrdersCount = recentOrdersData.orders.edges.length

    return {
      totalOrders: data.shop.ordersCount,
      recentOrders: recentOrdersCount,
      totalSales: data.shop.totalSales,
      currencyCode: data.shop.currencyCode,
    }
  } catch (error) {
    console.error("Error fetching order stats:", error)
    throw new Error(`Error al cargar estadísticas de pedidos: ${error.message}`)
  }
}

// Función para actualizar el estado de un pedido
export async function updateOrderStatus(id, status) {
  try {
    const mutation = gql`
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            displayFinancialStatus
            displayFulfillmentStatus
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
        tags: status ? [status] : [],
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.orderUpdate.userErrors.length > 0) {
      throw new Error(data.orderUpdate.userErrors[0].message)
    }

    return data.orderUpdate.order
  } catch (error) {
    console.error(`Error updating order status for ID ${id}:`, error)
    throw new Error(`Error al actualizar el estado del pedido: ${error.message}`)
  }
}

// Función para obtener los pedidos recientes
export async function fetchRecentOrders(limit = 5) {
  try {
    return fetchOrders(limit, null, "")
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error(`Error al cargar pedidos recientes: ${error.message}`)
  }
}
