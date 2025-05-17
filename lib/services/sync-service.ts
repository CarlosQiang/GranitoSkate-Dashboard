import { shopifyFetch } from "@/lib/shopify"

export async function obtenerClientesDeShopify(limit = 50) {
  try {
    const query = `
      query {
        customers(first: ${limit}) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los clientes de Shopify")
    }

    return response.data.customers.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error al obtener clientes de Shopify:", error)
    throw error
  }
}

export async function obtenerColeccionesDeShopify(limit = 50) {
  try {
    const query = `
      query {
        collections(first: ${limit}) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener las colecciones de Shopify")
    }

    return response.data.collections.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error al obtener colecciones de Shopify:", error)
    throw error
  }
}

export async function obtenerPedidosDeShopify(limit = 50) {
  try {
    const query = `
      query {
        orders(first: ${limit}) {
          edges {
            node {
              id
              name
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

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los pedidos de Shopify")
    }

    return response.data.orders.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error al obtener pedidos de Shopify:", error)
    throw error
  }
}
