import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCustomers(limit = 20) {
  try {
    // Consulta actualizada según la documentación de Shopify
    const query = gql`
      query {
        customers(first: ${limit}) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              ordersCount
              totalSpent {
                amount
                currencyCode
              }
              createdAt
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.customers || !data.customers.edges) {
      console.warn("No se encontraron clientes o la respuesta está incompleta")
      return []
    }

    return data.customers.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      email: edge.node.email,
      phone: edge.node.phone,
      ordersCount: edge.node.ordersCount,
      totalSpent: edge.node.totalSpent,
      createdAt: edge.node.createdAt,
    }))
  } catch (error) {
    console.error("Error fetching customers:", error)
    // Devolver un array vacío para evitar errores en la UI
    return []
  }
}

export async function fetchCustomerById(id: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    const query = gql`
      query {
        customer(id: "${formattedId}") {
          id
          firstName
          lastName
          email
          phone
          acceptsMarketing
          createdAt
          defaultAddress {
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          addresses(first: 10) {
            edges {
              node {
                id
                address1
                address2
                city
                province
                zip
                country
                phone
              }
            }
          }
          orders(first: 10) {
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
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.customer) {
      throw new Error(`Cliente no encontrado: ${id}`)
    }

    return data.customer
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    throw new Error(`Error al cargar cliente: ${(error as Error).message}`)
  }
}

export async function searchCustomers(searchTerm: string, limit = 20) {
  try {
    // Consulta para buscar clientes por nombre o email
    const query = gql`
      query {
        customers(first: ${limit}, query: "${searchTerm}") {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              ordersCount
              totalSpent {
                amount
                currencyCode
              }
              createdAt
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.customers || !data.customers.edges) {
      return []
    }

    return data.customers.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      email: edge.node.email,
      phone: edge.node.phone,
      ordersCount: edge.node.ordersCount,
      totalSpent: edge.node.totalSpent,
      createdAt: edge.node.createdAt,
    }))
  } catch (error) {
    console.error("Error searching customers:", error)
    return []
  }
}

// Otras funciones existentes...
export async function updateCustomer(id: string, customerData: any) {
  // Implementación existente...
}

export async function createCustomer(customerData: any) {
  // Implementación existente...
}

export async function deleteCustomer(id: string) {
  // Implementación existente...
}

export async function addCustomerAddress(customerId: string, addressData: any) {
  // Implementación existente...
}

export async function deleteCustomerAddress(customerId: string, addressId: string) {
  // Implementación existente...
}

export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  // Implementación existente...
}
