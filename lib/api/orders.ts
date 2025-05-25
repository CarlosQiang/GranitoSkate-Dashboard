import { shopifyFetch } from "@/lib/shopify"

export interface Order {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
  totalPrice: string
  subtotalPrice: string
  totalTax: string
  currencyCode: string
  displayFinancialStatus: string
  displayFulfillmentStatus: string
  customer?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  lineItems: Array<{
    id: string
    title: string
    quantity: number
    price: string
    product?: {
      id: string
      title: string
    }
  }>
  shippingAddress?: {
    address1: string
    city: string
    country: string
    zip: string
  }
}

export async function fetchOrders(limit = 50): Promise<Order[]> {
  try {
    const query = `
      query {
        orders(first: ${limit}, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              email
              createdAt
              updatedAt
              totalPrice
              subtotalPrice
              totalTax
              currencyCode
              displayFinancialStatus
              displayFulfillmentStatus
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
                    price
                    product {
                      id
                      title
                    }
                  }
                }
              }
              shippingAddress {
                address1
                city
                country
                zip
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      console.error("Error fetching orders:", response.errors)
      return []
    }

    return (
      response.data?.orders?.edges?.map((edge: any) => ({
        ...edge.node,
        lineItems: edge.node.lineItems?.edges?.map((lineEdge: any) => lineEdge.node) || [],
      })) || []
    )
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Order/${id}`

    const query = `
      query {
        order(id: "${formattedId}") {
          id
          name
          email
          createdAt
          updatedAt
          totalPrice
          subtotalPrice
          totalTax
          currencyCode
          displayFinancialStatus
          displayFulfillmentStatus
          customer {
            id
            firstName
            lastName
            email
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                price
                product {
                  id
                  title
                }
              }
            }
          }
          shippingAddress {
            address1
            city
            country
            zip
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.order) {
      return null
    }

    const order = response.data.order
    return {
      ...order,
      lineItems: order.lineItems?.edges?.map((edge: any) => edge.node) || [],
    }
  } catch (error) {
    console.error("Error fetching order by ID:", error)
    return null
  }
}

export async function fetchRecentOrders(limit = 5): Promise<Order[]> {
  return fetchOrders(limit)
}

export async function getOrdersAnalytics() {
  try {
    const orders = await fetchOrders(100)

    const totalRevenue = orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      orders,
    }
  } catch (error) {
    console.error("Error getting orders analytics:", error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      orders: [],
    }
  }
}
