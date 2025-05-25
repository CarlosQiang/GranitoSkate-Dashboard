import { shopifyFetch } from "@/lib/shopify"

export interface Order {
  id: string
  name: string
  email: string
  phone: string
  totalPrice: string
  currencyCode: string
  financialStatus: string
  fulfillmentStatus: string
  processedAt: string
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
    variant?: {
      id: string
      title: string
      price: string
    }
  }>
}

export async function fetchOrders(limit = 10): Promise<Order[]> {
  try {
    const query = `
      query {
        orders(first: ${limit}) {
          edges {
            node {
              id
              name
              email
              phone
              processedAt
              financialStatus
              fulfillmentStatus
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
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      price
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(response.errors.map((e: any) => e.message).join(", "))
    }

    return (
      response.data?.orders?.edges?.map((edge: any) => ({
        ...edge.node,
        totalPrice: edge.node.totalPriceSet?.shopMoney?.amount || "0",
        currencyCode: edge.node.totalPriceSet?.shopMoney?.currencyCode || "USD",
        lineItems: edge.node.lineItems?.edges?.map((itemEdge: any) => itemEdge.node) || [],
      })) || []
    )
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const query = `
      query {
        order(id: "gid://shopify/Order/${id}") {
          id
          name
          email
          phone
          processedAt
          financialStatus
          fulfillmentStatus
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
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  title
                  price
                }
              }
            }
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
      totalPrice: order.totalPriceSet?.shopMoney?.amount || "0",
      currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || "USD",
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

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const query = `
      query {
        customer(id: "gid://shopify/Customer/${customerId}") {
          orders(first: 50) {
            edges {
              node {
                id
                name
                email
                phone
                processedAt
                financialStatus
                fulfillmentStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      title
                      quantity
                      variant {
                        id
                        title
                        price
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.customer) {
      return []
    }

    return (
      response.data.customer.orders?.edges?.map((edge: any) => ({
        ...edge.node,
        totalPrice: edge.node.totalPriceSet?.shopMoney?.amount || "0",
        currencyCode: edge.node.totalPriceSet?.shopMoney?.currencyCode || "USD",
        lineItems: edge.node.lineItems?.edges?.map((itemEdge: any) => itemEdge.node) || [],
      })) || []
    )
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    return []
  }
}
