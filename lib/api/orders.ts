import { shopifyFetch } from "@/lib/shopify"

export interface Order {
  id: string
  name: string
  createdAt: string
  displayFinancialStatus: string
  displayFulfillmentStatus: string
  totalPriceSet: {
    shopMoney: {
      amount: string
      currencyCode: string
    }
  }
  customer?: {
    firstName: string
    lastName: string
    email: string
  }
  lineItems: {
    edges: {
      node: {
        id: string
        title: string
        quantity: number
        variant: {
          price: string
          product: {
            id: string
            title: string
          }
        }
      }
    }[]
  }
}

// Consulta para obtener pedidos
const GET_ORDERS = `
  query GetOrders($first: Int!, $after: String) {
    orders(first: $first, after: $after) {
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
            firstName
            lastName
            email
          }
          lineItems(first: 5) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  price
                  product {
                    id
                    title
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

// Función para obtener pedidos
export async function getOrders(
  first = 10,
  after?: string,
): Promise<{
  orders: Order[]
  pageInfo: { hasNextPage: boolean; endCursor: string }
}> {
  try {
    const data = await shopifyFetch({
      query: GET_ORDERS,
      variables: { first, after },
    })

    const orders = data.orders.edges.map((edge: any) => edge.node)
    const pageInfo = data.orders.pageInfo

    return { orders, pageInfo }
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    throw error
  }
}

// Consulta para obtener un pedido por ID
const GET_ORDER_BY_ID = `
  query GetOrderById($id: ID!) {
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
      customer {
        firstName
        lastName
        email
        phone
        defaultAddress {
          address1
          address2
          city
          province
          country
          zip
        }
      }
      shippingAddress {
        address1
        address2
        city
        province
        country
        zip
      }
      lineItems(first: 20) {
        edges {
          node {
            id
            title
            quantity
            variant {
              price
              title
              product {
                id
                title
                images(first: 1) {
                  edges {
                    node {
                      url
                    }
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

// Función para obtener un pedido por ID
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const data = await shopifyFetch({
      query: GET_ORDER_BY_ID,
      variables: { id },
    })

    return data.order
  } catch (error) {
    console.error("Error al obtener el pedido:", error)
    throw error
  }
}
