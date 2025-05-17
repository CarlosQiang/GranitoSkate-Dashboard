"\"use server"

import { shopifyFetch } from "@/lib/shopify"

// Función para obtener colecciones reales de Shopify
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

    if (!response.data || !response.data.collections) {
      throw new Error("No se pudieron obtener las colecciones")
    }

    return response.data.collections.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error al obtener colecciones de Shopify:", error)
    return []
  }
}

// Función para obtener clientes reales de Shopify
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
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (!response.data || !response.data.customers) {
      throw new Error("No se pudieron obtener los clientes")
    }

    return response.data.customers.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error al obtener clientes de Shopify:", error)
    return []
  }
}

// Función para obtener pedidos reales de Shopify
export async function obtenerPedidosDeShopify(limit = 50) {
  try {
    const query = `
      query {
        orders(first: ${limit}) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (!response.data || !response.data.orders) {
      throw new Error("No se pudieron obtener los pedidos")
    }

    return response.data.orders.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error al obtener pedidos de Shopify:", error)
    return []
  }
}
"\
