import { shopifyFetch } from "./shopifyFetch"
import type {
  Customer,
  CustomersResponse,
  CustomerInput,
  CustomerUpdateInput,
  CustomerAddress,
  CustomerOrder,
} from "@/types/customers"

// Verificar si las variables de entorno de Shopify están definidas
const checkShopifyEnvVars = () => {
  if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
    throw new Error("Shopify environment variables not defined. Please check your .env file.")
  }
}

// Obtener todos los clientes con paginación y filtros
export async function fetchCustomers(first = 20, query?: string, after?: string): Promise<CustomersResponse> {
  try {
    const variables: { first: number; query?: string; after?: string } = { first }
    if (query) {
      variables.query = query
    }
    if (after) {
      variables.after = after
    }

    const graphqlQuery = `
      query getCustomers($first: Int!, $query: String, $after: String) {
        customers(first: $first, query: $query, after: $after, sortKey: UPDATED_AT, reverse: true) {
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
              acceptsMarketing
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables,
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (!data?.customers?.edges) {
      return { customers: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } }
    }

    const customers = data.customers.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName || "",
      lastName: edge.node.lastName || "",
      email: edge.node.email || "",
      phone: edge.node.phone || "",
      ordersCount: edge.node.ordersCount || 0,
      totalSpent: edge.node.totalSpent || { amount: "0", currencyCode: "EUR" },
      createdAt: edge.node.createdAt,
      tags: edge.node.tags || [],
      verifiedEmail: edge.node.verifiedEmail || false,
      acceptsMarketing: edge.node.acceptsMarketing || false,
    }))

    const pageInfo = data.customers.pageInfo || {
      hasNextPage: false,
      hasPreviousPage: false,
      endCursor: null,
      startCursor: null,
    }

    return {
      customers,
      pageInfo,
    }
  } catch (error: any) {
    console.error("Error fetching customers:", error)
    throw new Error(`No se pudieron cargar los clientes: ${error.message}`)
  }
}

// Obtener un cliente por ID
export async function fetchCustomerById(id: string): Promise<Customer> {
  try {
    const graphqlQuery = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
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
          updatedAt
          note
          tags
          verifiedEmail
          acceptsMarketing
          addresses(first: 10) {
            edges {
              node {
                id
                address1
                address2
                city
                country
                province
                zip
                phone
              }
            }
          }
          defaultAddress {
            id
            address1
            address2
            city
            country
            province
            zip
            phone
          }
        }
      }
    `

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: { id: formattedId },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (!data?.customer) {
      throw new Error(`Cliente con ID ${id} no encontrado`)
    }

    const customer = data.customer
    const addresses =
      customer.addresses?.edges?.map((edge: any) => ({
        id: edge.node.id.split("/").pop(),
        address1: edge.node.address1,
        address2: edge.node.address2,
        city: edge.node.city,
        country: edge.node.country,
        province: edge.node.province,
        zip: edge.node.zip,
        phone: edge.node.phone,
      })) || []

    const defaultAddress = customer.defaultAddress
      ? {
          id: customer.defaultAddress.id.split("/").pop(),
          address1: customer.defaultAddress.address1,
          address2: customer.defaultAddress.address2,
          city: customer.defaultAddress.city,
          country: customer.defaultAddress.country,
          province: customer.defaultAddress.province,
          zip: customer.defaultAddress.zip,
          phone: customer.defaultAddress.phone,
        }
      : undefined

    return {
      id: customer.id.split("/").pop(),
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email,
      phone: customer.phone || "",
      ordersCount: customer.ordersCount || 0,
      totalSpent: customer.totalSpent || { amount: "0", currencyCode: "EUR" },
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      note: customer.note || "",
      tags: customer.tags || [],
      verifiedEmail: customer.verifiedEmail || false,
      acceptsMarketing: customer.acceptsMarketing || false,
      addresses,
      defaultAddress,
    }
  } catch (error: any) {
    console.error(`Error al obtener cliente con ID ${id}:`, error)
    throw new Error(`No se pudo cargar la información del cliente: ${error.message}`)
  }
}

// Obtener los pedidos de un cliente
export async function fetchCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
  try {
    const graphqlQuery = `
      query getCustomerOrders($customerId: ID!) {
        customer(id: $customerId) {
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
                lineItems(first: 5) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
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
      }
    `

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = customerId.includes("gid://") ? customerId : `gid://shopify/Customer/${customerId}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: { customerId: formattedId },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (!data?.customer?.orders?.edges) {
      return []
    }

    return data.customer.orders.edges.map((edge: any) => {
      const lineItems =
        edge.node.lineItems?.edges?.map((item: any) => ({
          title: item.node.title,
          quantity: item.node.quantity,
          variant: item.node.variant
            ? {
                title: item.node.variant.title,
                price: item.node.variant.price,
              }
            : undefined,
        })) || []

      return {
        id: edge.node.id.split("/").pop(),
        name: edge.node.name,
        processedAt: edge.node.processedAt,
        fulfillmentStatus: edge.node.fulfillmentStatus,
        financialStatus: edge.node.financialStatus,
        totalPrice: edge.node.totalPrice,
        lineItems,
      }
    })
  } catch (error: any) {
    console.error(`Error al obtener pedidos del cliente ${customerId}:`, error)
    throw new Error(`No se pudieron cargar los pedidos del cliente: ${error.message}`)
  }
}

// Crear un nuevo cliente
export async function createCustomer(customerData: CustomerInput): Promise<Customer> {
  try {
    const graphqlQuery = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
            acceptsMarketing
            createdAt
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        input: {
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          email: customerData.email,
          phone: customerData.phone,
          note: customerData.note,
          acceptsMarketing: customerData.acceptsMarketing || false,
          tags: customerData.tags || [],
        },
      },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (data?.customerCreate?.userErrors?.length > 0) {
      throw new Error(data.customerCreate.userErrors.map((e: any) => e.message).join(", "))
    }

    if (!data?.customerCreate?.customer) {
      throw new Error("No se pudo crear el cliente")
    }

    const customer = data.customerCreate.customer
    return {
      id: customer.id.split("/").pop(),
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email,
      phone: customer.phone || "",
      tags: customer.tags || [],
      acceptsMarketing: customer.acceptsMarketing || false,
      createdAt: customer.createdAt,
      verifiedEmail: false,
      addresses: [],
      ordersCount: 0,
      totalSpent: { amount: "0", currencyCode: "EUR" },
    }
  } catch (error: any) {
    console.error("Error creating customer:", error)
    throw new Error(`No se pudo crear el cliente: ${error.message}`)
  }
}

// Actualizar un cliente existente
export async function updateCustomer(id: string, customerData: Partial<CustomerUpdateInput>): Promise<Customer> {
  try {
    const graphqlQuery = `
      mutation customerUpdate($input: CustomerInput!) {
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

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        input: {
          id: formattedId,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          note: customerData.note,
          acceptsMarketing: customerData.acceptsMarketing,
          tags: customerData.tags,
        },
      },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (data?.customerUpdate?.userErrors?.length > 0) {
      throw new Error(data.customerUpdate.userErrors.map((e: any) => e.message).join(", "))
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error("No se pudo actualizar el cliente")
    }

    const customer = data.customerUpdate.customer
    return {
      id: customer.id.split("/").pop(),
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email,
      phone: customer.phone || "",
      note: customer.note || "",
      tags: customer.tags || [],
      acceptsMarketing: customer.acceptsMarketing || false,
      createdAt: new Date().toISOString(), // Placeholder, no viene en la respuesta
      verifiedEmail: false, // Placeholder, no viene en la respuesta
      addresses: [], // Placeholder, no viene en la respuesta
      ordersCount: 0, // Placeholder, no viene en la respuesta
      totalSpent: { amount: "0", currencyCode: "EUR" }, // Placeholder, no viene en la respuesta
    }
  } catch (error: any) {
    console.error(`Error updating customer ${id}:`, error)
    throw new Error(`No se pudo actualizar el cliente: ${error.message}`)
  }
}

// Eliminar un cliente
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const graphqlQuery = `
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

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: { id: formattedId },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (data?.customerDelete?.userErrors?.length > 0) {
      throw new Error(data.customerDelete.userErrors.map((e: any) => e.message).join(", "))
    }

    return !!data?.customerDelete?.deletedCustomerId
  } catch (error: any) {
    console.error(`Error deleting customer ${id}:`, error)
    throw new Error(`No se pudo eliminar el cliente: ${error.message}`)
  }
}

// Añadir una dirección a un cliente
export async function addCustomerAddress(
  customerId: string,
  address: Omit<CustomerAddress, "id">,
): Promise<CustomerAddress> {
  try {
    const graphqlQuery = `
      mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
        customerAddressCreate(customerId: $customerId, address: $address) {
          customerAddress {
            id
            address1
            address2
            city
            company
            country
            firstName
            lastName
            phone
            province
            zip
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = customerId.includes("gid://") ? customerId : `gid://shopify/Customer/${customerId}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        customerId: formattedId,
        address,
      },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (data?.customerAddressCreate?.userErrors?.length > 0) {
      throw new Error(data.customerAddressCreate.userErrors.map((e: any) => e.message).join(", "))
    }

    if (!data?.customerAddressCreate?.customerAddress) {
      throw new Error("No se pudo añadir la dirección")
    }

    const customerAddress = data.customerAddressCreate.customerAddress
    return {
      id: customerAddress.id.split("/").pop(),
      address1: customerAddress.address1,
      address2: customerAddress.address2,
      city: customerAddress.city,
      company: customerAddress.company,
      country: customerAddress.country,
      firstName: customerAddress.firstName,
      lastName: customerAddress.lastName,
      phone: customerAddress.phone,
      province: customerAddress.province,
      zip: customerAddress.zip,
    }
  } catch (error: any) {
    console.error(`Error adding address to customer ${customerId}:`, error)
    throw new Error(`No se pudo añadir la dirección: ${error.message}`)
  }
}

// Eliminar una dirección de cliente
export async function deleteCustomerAddress(addressId: string): Promise<boolean> {
  try {
    const graphqlQuery = `
      mutation customerAddressDelete($id: ID!) {
        customerAddressDelete(id: $id) {
          deletedCustomerAddressId
          userErrors {
            field
            message
          }
        }
      }
    `

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = addressId.includes("gid://") ? addressId : `gid://shopify/CustomerAddress/${addressId}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        id: formattedId,
      },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (data?.customerAddressDelete?.userErrors?.length > 0) {
      throw new Error(data.customerAddressDelete.userErrors.map((e: any) => e.message).join(", "))
    }

    return !!data?.customerAddressDelete?.deletedCustomerAddressId
  } catch (error: any) {
    console.error(`Error deleting address ${addressId}:`, error)
    throw new Error(`No se pudo eliminar la dirección: ${error.message}`)
  }
}

// Establecer una dirección como predeterminada
export async function setDefaultCustomerAddress(customerId: string, addressId: string): Promise<boolean> {
  try {
    const graphqlQuery = `
      mutation customerDefaultAddressUpdate($customerId: ID!, $addressId: ID!) {
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

    // Asegurarse de que los IDs tengan el formato correcto para la API de Shopify
    const formattedCustomerId = customerId.includes("gid://") ? customerId : `gid://shopify/Customer/${customerId}`
    const formattedAddressId = addressId.includes("gid://") ? addressId : `gid://shopify/CustomerAddress/${addressId}`

    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        customerId: formattedCustomerId,
        addressId: formattedAddressId,
      },
    })

    if (!response) {
      throw new Error("No response from Shopify API")
    }

    const { data, errors } = response

    if (errors) {
      throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`)
    }

    if (data?.customerDefaultAddressUpdate?.userErrors?.length > 0) {
      throw new Error(data.customerDefaultAddressUpdate.userErrors.map((e: any) => e.message).join(", "))
    }

    return !!data?.customerDefaultAddressUpdate?.customer
  } catch (error: any) {
    console.error(`Error setting default address for customer ${customerId}:`, error)
    throw new Error(`No se pudo establecer la dirección predeterminada: ${error.message}`)
  }
}

// Función para obtener clientes (alias para compatibilidad)
export const getCustomers = fetchCustomers
export const getCustomer = fetchCustomerById
