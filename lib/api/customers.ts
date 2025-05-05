import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { CustomerInput, CustomerAddress } from "@/types/customers"

// Obtener todos los clientes con paginación y búsqueda
export async function fetchCustomers(limit = 20, query = "", cursor = null) {
  const variables: any = { limit }

  if (cursor) {
    variables.cursor = cursor
  }

  if (query) {
    variables.query = query
  }

  const queryStr = gql`
    query GetCustomers($limit: Int!, $cursor: String, $query: String) {
      customers(first: $limit, after: $cursor, query: $query, sortKey: CREATED_AT, reverse: true) {
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
            tags
            verifiedEmail
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(queryStr, variables)

    return {
      customers: data.customers.edges.map((edge: any) => ({
        id: edge.node.id.split("/").pop(),
        firstName: edge.node.firstName,
        lastName: edge.node.lastName,
        email: edge.node.email,
        phone: edge.node.phone,
        ordersCount: edge.node.ordersCount,
        totalSpent: edge.node.totalSpent,
        createdAt: edge.node.createdAt,
        tags: edge.node.tags,
        verifiedEmail: edge.node.verifiedEmail,
      })),
      pageInfo: data.customers.pageInfo,
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error("No se pudieron cargar los clientes")
  }
}

// Obtener un cliente por ID
export async function fetchCustomerById(id: string) {
  const query = gql`
    query GetCustomerById($id: ID!) {
      customer(id: $id) {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
        createdAt
        updatedAt
        note
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
        orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
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

  try {
    const data = await shopifyClient.request(query, { id: `gid://shopify/Customer/${id}` })

    if (!data.customer) {
      throw new Error(`Cliente con ID ${id} no encontrado`)
    }

    // Transformar las direcciones y pedidos
    const addresses = data.customer.addresses.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      ...edge.node,
    }))

    const orders = data.customer.orders.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      ...edge.node,
    }))

    // Transformar la dirección predeterminada
    const defaultAddress = data.customer.defaultAddress
      ? {
          id: data.customer.defaultAddress.id.split("/").pop(),
          ...data.customer.defaultAddress,
        }
      : null

    return {
      id: data.customer.id.split("/").pop(),
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
      acceptsMarketing: data.customer.acceptsMarketing,
      createdAt: data.customer.createdAt,
      updatedAt: data.customer.updatedAt,
      note: data.customer.note,
      tags: data.customer.tags,
      verifiedEmail: data.customer.verifiedEmail,
      addresses,
      defaultAddress,
      orders,
    }
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    throw new Error(`No se pudo cargar la información del cliente`)
  }
}

// Crear un nuevo cliente
export async function createCustomer(customerData: CustomerInput) {
  const mutation = gql`
    mutation CustomerCreate($input: CustomerInput!) {
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

  try {
    const data = await shopifyClient.request(mutation, {
      input: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        note: customerData.note,
        acceptsMarketing: customerData.acceptsMarketing,
        tags: customerData.tags,
      },
    })

    if (data.customerCreate.userErrors.length > 0) {
      throw new Error(data.customerCreate.userErrors[0].message)
    }

    return {
      id: data.customerCreate.customer.id.split("/").pop(),
      ...data.customerCreate.customer,
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

// Actualizar un cliente existente
export async function updateCustomer(id: string, customerData: any) {
  const mutation = gql`
    mutation CustomerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
          phone
          note
          acceptsMarketing
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      input: {
        id: `gid://shopify/Customer/${id}`,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        note: customerData.note,
        acceptsMarketing: customerData.acceptsMarketing,
        tags: customerData.tags,
      },
    })

    if (data.customerUpdate.userErrors.length > 0) {
      throw new Error(data.customerUpdate.userErrors[0].message)
    }

    return {
      id: data.customerUpdate.customer.id.split("/").pop(),
      ...data.customerUpdate.customer,
    }
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error)
    throw error
  }
}

// Eliminar un cliente
export async function deleteCustomer(id: string) {
  const mutation = gql`
    mutation CustomerDelete($id: ID!) {
      customerDelete(input: { id: $id }) {
        deletedCustomerId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      id: `gid://shopify/Customer/${id}`,
    })

    if (data.customerDelete.userErrors.length > 0) {
      throw new Error(data.customerDelete.userErrors[0].message)
    }

    return true
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error)
    throw error
  }
}

// Añadir una dirección a un cliente
export async function addCustomerAddress(customerId: string, address: CustomerAddress) {
  const mutation = gql`
    mutation CustomerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
      customerAddressCreate(customerId: $customerId, address: $address) {
        customerAddress {
          id
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      customerId: `gid://shopify/Customer/${customerId}`,
      address,
    })

    if (data.customerAddressCreate.userErrors.length > 0) {
      throw new Error(data.customerAddressCreate.userErrors[0].message)
    }

    return {
      id: data.customerAddressCreate.customerAddress.id.split("/").pop(),
      ...data.customerAddressCreate.customerAddress,
    }
  } catch (error) {
    console.error(`Error adding address to customer ${customerId}:`, error)
    throw error
  }
}

// Eliminar una dirección de cliente
export async function deleteCustomerAddress(addressId: string) {
  const mutation = gql`
    mutation CustomerAddressDelete($id: ID!) {
      customerAddressDelete(id: $id) {
        deletedCustomerAddressId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      id: `gid://shopify/CustomerAddress/${addressId}`,
    })

    if (data.customerAddressDelete.userErrors.length > 0) {
      throw new Error(data.customerAddressDelete.userErrors[0].message)
    }

    return true
  } catch (error) {
    console.error(`Error deleting address ${addressId}:`, error)
    throw error
  }
}

// Establecer una dirección como predeterminada
export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  const mutation = gql`
    mutation CustomerDefaultAddressUpdate($customerId: ID!, $addressId: ID!) {
      customerDefaultAddressUpdate(customerId: $customerId, addressId: $addressId) {
        customer {
          id
          defaultAddress {
            id
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      customerId: `gid://shopify/Customer/${customerId}`,
      addressId: `gid://shopify/CustomerAddress/${addressId}`,
    })

    if (data.customerDefaultAddressUpdate.userErrors.length > 0) {
      throw new Error(data.customerDefaultAddressUpdate.userErrors[0].message)
    }

    return true
  } catch (error) {
    console.error(`Error setting default address for customer ${customerId}:`, error)
    throw error
  }
}
