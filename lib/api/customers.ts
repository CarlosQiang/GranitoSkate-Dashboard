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

    // Consulta actualizada según la documentación actual de Shopify Admin API 2023-07
    const query = gql`
      query GetCustomers($limit: Int!) {
        customers(first: $limit) {
          edges {
            node {
              id
              displayName
              firstName
              lastName
              email
              phone
              ordersCount
              totalSpent
              createdAt
              updatedAt
              tags
              verifiedEmail
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.customers || !data.customers.edges) {
      console.warn("No se encontraron clientes o la respuesta está incompleta")
      return []
    }

    const customers = data.customers.edges.map((edge) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName || "",
      lastName: edge.node.lastName || "",
      displayName:
        edge.node.displayName ||
        `${edge.node.firstName || ""} ${edge.node.lastName || ""}`.trim() ||
        "Cliente sin nombre",
      email: edge.node.email || "",
      phone: edge.node.phone || null,
      ordersCount: edge.node.ordersCount || 0,
      totalSpent: edge.node.totalSpent || "0",
      createdAt: edge.node.createdAt || new Date().toISOString(),
      updatedAt: edge.node.updatedAt || new Date().toISOString(),
      tags: edge.node.tags || [],
      verifiedEmail: edge.node.verifiedEmail || false,
    }))

    // Update cache
    customersCache = customers
    lastCustomersUpdate = new Date()

    console.log(`Successfully fetched ${customers.length} customers`)
    return customers
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error(`Error al cargar clientes: ${(error as Error).message}`)
  }
}

export async function fetchCustomerById(id) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    console.log(`Fetching customer with ID: ${formattedId}`)

    // Consulta actualizada según la documentación actual de Shopify Admin API 2023-07
    const query = gql`
      query GetCustomerById($id: ID!) {
        customer(id: $id) {
          id
          displayName
          firstName
          lastName
          email
          phone
          acceptsMarketing
          createdAt
          updatedAt
          ordersCount
          totalSpent
          tags
          verifiedEmail
          defaultAddress {
            id
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          addresses(first: 5) {
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
          orders(first: 5) {
            edges {
              node {
                id
                name
                processedAt
                totalPrice
                financialStatus
                fulfillmentStatus
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.customer) {
      throw new Error(`Cliente no encontrado: ${id}`)
    }

    // Transformar los datos para que sean más fáciles de usar
    const customer = {
      ...data.customer,
      id: data.customer.id.split("/").pop(),
      displayName:
        data.customer.displayName ||
        `${data.customer.firstName || ""} ${data.customer.lastName || ""}`.trim() ||
        "Cliente sin nombre",
      addresses:
        data.customer.addresses?.edges?.map((edge) => ({
          ...edge.node,
          id: edge.node.id.split("/").pop(),
        })) || [],
      orders:
        data.customer.orders?.edges?.map((edge) => ({
          ...edge.node,
          id: edge.node.id.split("/").pop(),
        })) || [],
    }

    return customer
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    throw new Error(`Error al cargar cliente: ${(error as Error).message}`)
  }
}

export async function searchCustomers(searchTerm, limit = 20) {
  try {
    // Consulta para buscar clientes
    const query = gql`
      query SearchCustomers($searchTerm: String!, $limit: Int!) {
        customers(first: $limit, query: $searchTerm) {
          edges {
            node {
              id
              displayName
              firstName
              lastName
              email
              phone
              ordersCount
              totalSpent
              createdAt
              updatedAt
              tags
              verifiedEmail
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { searchTerm, limit })

    if (!data || !data.customers || !data.customers.edges) {
      return []
    }

    return data.customers.edges.map((edge) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName || "",
      lastName: edge.node.lastName || "",
      displayName:
        edge.node.displayName ||
        `${edge.node.firstName || ""} ${edge.node.lastName || ""}`.trim() ||
        "Cliente sin nombre",
      email: edge.node.email || "",
      phone: edge.node.phone || null,
      ordersCount: edge.node.ordersCount || 0,
      totalSpent: edge.node.totalSpent || "0",
      createdAt: edge.node.createdAt || new Date().toISOString(),
      updatedAt: edge.node.updatedAt || new Date().toISOString(),
      tags: edge.node.tags || [],
      verifiedEmail: edge.node.verifiedEmail || false,
    }))
  } catch (error) {
    console.error("Error searching customers:", error)
    throw new Error(`Error al buscar clientes: ${(error as Error).message}`)
  }
}

// Funciones para gestión de clientes
export async function updateCustomer(id, customerData) {
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

export async function createCustomer(customerData) {
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

export async function deleteCustomer(id) {
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

// Funciones para gestionar direcciones de clientes
export async function addCustomerAddress(customerId, addressData) {
  try {
    // Formatear el ID correctamente
    let formattedId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${customerId}`
    }

    const mutation = gql`
      mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
        customerAddressCreate(customerId: $customerId, address: $address) {
          customerAddress {
            id
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
      address: {
        address1: addressData.address1,
        address2: addressData.address2,
        city: addressData.city,
        province: addressData.province,
        zip: addressData.zip,
        country: addressData.country,
        phone: addressData.phone,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.customerAddressCreate.userErrors && data.customerAddressCreate.userErrors.length > 0) {
      throw new Error(data.customerAddressCreate.userErrors[0].message)
    }

    return {
      id: data.customerAddressCreate.customerAddress.id.split("/").pop(),
      ...addressData,
    }
  } catch (error) {
    console.error(`Error adding address to customer ${customerId}:`, error)
    throw new Error(`Error al añadir dirección: ${(error as Error).message}`)
  }
}

export async function deleteCustomerAddress(customerId, addressId) {
  try {
    // Formatear los IDs correctamente
    let formattedCustomerId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedCustomerId = `gid://shopify/Customer/${customerId}`
    }

    let formattedAddressId = addressId
    if (!addressId.includes("gid://shopify/")) {
      formattedAddressId = `gid://shopify/MailingAddress/${addressId}`
    }

    const mutation = gql`
      mutation customerAddressDelete($id: ID!, $customerAddressId: ID!) {
        customerAddressDelete(customerId: $id, id: $customerAddressId) {
          deletedCustomerAddressId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedCustomerId,
      customerAddressId: formattedAddressId,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.customerAddressDelete.userErrors && data.customerAddressDelete.userErrors.length > 0) {
      throw new Error(data.customerAddressDelete.userErrors[0].message)
    }

    return { success: true, id: addressId }
  } catch (error) {
    console.error(`Error deleting address ${addressId} from customer ${customerId}:`, error)
    throw new Error(`Error al eliminar dirección: ${(error as Error).message}`)
  }
}

export async function setDefaultCustomerAddress(customerId, addressId) {
  try {
    // Formatear los IDs correctamente
    let formattedCustomerId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedCustomerId = `gid://shopify/Customer/${customerId}`
    }

    let formattedAddressId = addressId
    if (!addressId.includes("gid://shopify/")) {
      formattedAddressId = `gid://shopify/MailingAddress/${addressId}`
    }

    const mutation = gql`
      mutation customerDefaultAddressUpdate($customerId: ID!, $addressId: ID!) {
        customerDefaultAddressUpdate(customerId: $customerId, addressId: $addressId) {
          customer {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      customerId: formattedCustomerId,
      addressId: formattedAddressId,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.customerDefaultAddressUpdate.userErrors && data.customerDefaultAddressUpdate.userErrors.length > 0) {
      throw new Error(data.customerDefaultAddressUpdate.userErrors[0].message)
    }

    return { success: true, id: addressId }
  } catch (error) {
    console.error(`Error setting default address ${addressId} for customer ${customerId}:`, error)
    throw new Error(`Error al establecer dirección predeterminada: ${(error as Error).message}`)
  }
}
