import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let customersCache = null
let lastCustomersUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Fetches all customers from Shopify
 * @param limit Maximum number of customers to fetch
 * @returns List of customers
 */
export async function fetchCustomers(limit = 50) {
  try {
    // Use cache if it exists and is less than 5 minutes old
    const now = new Date()
    if (customersCache && lastCustomersUpdate && now.getTime() - lastCustomersUpdate.getTime() < CACHE_DURATION) {
      console.log("Using customers cache")
      return customersCache
    }

    console.log(`Fetching ${limit} customers from Shopify...`)

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
      console.warn("No se encontraron clientes o la respuesta está incompleta", data)
      return []
    }

    const customers = data.customers.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName || "",
      lastName: edge.node.lastName || "",
      email: edge.node.email || "",
      phone: edge.node.phone || null,
      ordersCount: edge.node.ordersCount || 0,
      totalSpent: edge.node.totalSpent || { amount: "0", currencyCode: "EUR" },
      createdAt: edge.node.createdAt || new Date().toISOString(),
    }))

    // Update cache
    customersCache = customers
    lastCustomersUpdate = new Date()

    console.log(`Successfully fetched ${customers.length} customers`)
    return customers
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

    return {
      ...data.customer,
      id: data.customer.id.split("/").pop(),
      addresses:
        data.customer.addresses?.edges?.map((edge: any) => ({
          ...edge.node,
          id: edge.node.id.split("/").pop(),
        })) || [],
      orders:
        data.customer.orders?.edges?.map((edge: any) => ({
          ...edge.node,
          id: edge.node.id.split("/").pop(),
        })) || [],
    }
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
      firstName: edge.node.firstName || "",
      lastName: edge.node.lastName || "",
      email: edge.node.email || "",
      phone: edge.node.phone || null,
      ordersCount: edge.node.ordersCount || 0,
      totalSpent: edge.node.totalSpent || { amount: "0", currencyCode: "EUR" },
      createdAt: edge.node.createdAt || new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Error searching customers:", error)
    return []
  }
}

// Funciones adicionales para gestión de clientes
export async function updateCustomer(id: string, customerData: any) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    const mutation = gql`
      mutation customerUpdate($input: CustomerInput!, $customerId: ID!) {
        customerUpdate(input: $input, id: $customerId) {
          customer {
            id
            firstName
            lastName
            email
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      customerId: formattedId,
      input: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        acceptsMarketing: customerData.acceptsMarketing,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.customerUpdate.userErrors && data.customerUpdate.userErrors.length > 0) {
      throw new Error(data.customerUpdate.userErrors[0].message)
    }

    // Invalidate cache
    customersCache = null
    lastCustomersUpdate = null

    return {
      id: data.customerUpdate.customer.id.split("/").pop(),
      ...data.customerUpdate.customer,
    }
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error)
    throw new Error(`Error al actualizar cliente: ${(error as Error).message}`)
  }
}

export async function createCustomer(customerData: any) {
  try {
    const mutation = gql`
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
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
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        acceptsMarketing: customerData.acceptsMarketing || false,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.customerCreate.userErrors && data.customerCreate.userErrors.length > 0) {
      throw new Error(data.customerCreate.userErrors[0].message)
    }

    // Invalidate cache
    customersCache = null
    lastCustomersUpdate = null

    return {
      id: data.customerCreate.customer.id.split("/").pop(),
      ...data.customerCreate.customer,
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error(`Error al crear cliente: ${(error as Error).message}`)
  }
}

export async function deleteCustomer(id: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    const mutation = gql`
      mutation customerDelete($id: ID!) {
        customerDelete(input: { id: $id }) {
          deletedCustomerId
          userErrors {
            field
            message
          }
        }
      }
    `

    const data = await shopifyClient.request(mutation, { id: formattedId })

    if (data.customerDelete.userErrors && data.customerDelete.userErrors.length > 0) {
      throw new Error(data.customerDelete.userErrors[0].message)
    }

    // Invalidate cache
    customersCache = null
    lastCustomersUpdate = null

    return { success: true, id: data.customerDelete.deletedCustomerId }
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error)
    throw new Error(`Error al eliminar cliente: ${(error as Error).message}`)
  }
}
