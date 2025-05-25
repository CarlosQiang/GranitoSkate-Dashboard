const SHOPIFY_GRAPHQL_ENDPOINT = "/api/shopify"

// Consulta GraphQL para obtener pedidos
const GET_ORDERS_QUERY = `
  query getOrders($first: Int!) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          processedAt
          displayFulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          customer {
            id
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
                  id
                  title
                  price {
                    amount
                    currencyCode
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

// Función para obtener pedidos recientes
export async function fetchRecentOrders(limit = 10) {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_ORDERS_QUERY,
        variables: {
          first: limit,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
    }

    // Transformar datos para compatibilidad
    const orders = data.data.orders.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id,
        name: node.name,
        processedAt: node.processedAt,
        displayFulfillmentStatus: node.displayFulfillmentStatus,
        totalPrice: node.totalPrice.amount,
        currencyCode: node.totalPrice.currencyCode,
        customer: node.customer,
        lineItems: node.lineItems.edges.map((item: any) => item.node),
      }
    })

    return orders
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    throw error
  }
}
