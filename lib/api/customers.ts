import { shopifyFetch } from "./shopifyFetch"

// Tipos para los clientes
export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  totalSpent?: string
  ordersCount?: number
  createdAt: string
}

// Consulta GraphQL para obtener clientes
const GET_CUSTOMERS = `
query GetCustomers($first: Int!, $query: String) {
  customers(first: $first, query: $query) {
    edges {
      node {
        id
        firstName
        lastName
        email
        phone
        totalSpent
        ordersCount
        createdAt
      }
    }
  }
}
`

// Función para obtener clientes
export async function fetchCustomers(limit = 50, searchQuery = ""): Promise<{ customers: Customer[] }> {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const query = searchQuery ? `${searchQuery}` : ""

    const { data, errors } = await shopifyFetch({
      query: GET_CUSTOMERS,
      variables: {
        first: limit,
        query: query,
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    // Transformar los datos de GraphQL a un formato más sencillo
    const customers = data.customers.edges.map(({ node }: { node: Customer }) => ({
      id: node.id,
      firstName: node.firstName || "",
      lastName: node.lastName || "",
      email: node.email || "",
      phone: node.phone || "",
      totalSpent: node.totalSpent || "0.00",
      ordersCount: node.ordersCount || 0,
      createdAt: node.createdAt,
    }))

    return { customers }
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error(`No se pudieron cargar los clientes: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Consulta GraphQL para obtener un cliente específico
const GET_CUSTOMER = `
query GetCustomer($id: ID!) {
  customer(id: $id) {
    id
    firstName
    lastName
    email
    phone
    totalSpent
    ordersCount
    createdAt
    addresses {
      id
      address1
      address2
      city
      province
      zip
      country
      phone
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

// Función para obtener un cliente específico por ID
export async function fetchCustomerById(id: string) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`

    const { data, errors } = await shopifyFetch({
      query: GET_CUSTOMER,
      variables: {
        id: formattedId,
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    return data.customer
  } catch (error) {
    console.error("Error fetching customer:", error)
    throw new Error(`No se pudo cargar el cliente: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para crear un cliente
export async function createCustomer(customerData: any) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const CREATE_CUSTOMER = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const { data, errors } = await shopifyFetch({
      query: CREATE_CUSTOMER,
      variables: {
        input: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
        },
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    if (data.customerCreate.userErrors.length > 0) {
      throw new Error(data.customerCreate.userErrors.map((e: any) => e.message).join(", "))
    }

    return data.customerCreate.customer
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error(`No se pudo crear el cliente: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para actualizar un cliente
export async function updateCustomer(id: string, customerData: any) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const UPDATE_CUSTOMER = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
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

    const { data, errors } = await shopifyFetch({
      query: UPDATE_CUSTOMER,
      variables: {
        input: {
          id: formattedId,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
        },
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    if (data.customerUpdate.userErrors.length > 0) {
      throw new Error(data.customerUpdate.userErrors.map((e: any) => e.message).join(", "))
    }

    return data.customerUpdate.customer
  } catch (error) {
    console.error("Error updating customer:", error)
    throw new Error(`No se pudo actualizar el cliente: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para eliminar un cliente
export async function deleteCustomer(id: string) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const DELETE_CUSTOMER = `
      mutation customerDelete($input: CustomerDeleteInput!) {
        customerDelete(input: $input) {
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

    const { data, errors } = await shopifyFetch({
      query: DELETE_CUSTOMER,
      variables: {
        input: {
          id: formattedId,
        },
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    if (data.customerDelete.userErrors.length > 0) {
      throw new Error(data.customerDelete.userErrors.map((e: any) => e.message).join(", "))
    }

    return data.customerDelete.deletedCustomerId
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw new Error(`No se pudo eliminar el cliente: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para añadir una dirección a un cliente
export async function addCustomerAddress(customerId: string, addressData: any) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const ADD_CUSTOMER_ADDRESS = `
      mutation customerAddressCreate($customerAddress: MailingAddressInput!, $customerId: ID!) {
        customerAddressCreate(address: $customerAddress, customerId: $customerId) {
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

    // Asegurarse de que el ID tenga el formato correcto para la API de Shopify
    const formattedId = customerId.includes("gid://") ? customerId : `gid://shopify/Customer/${customerId}`

    const { data, errors } = await shopifyFetch({
      query: ADD_CUSTOMER_ADDRESS,
      variables: {
        customerId: formattedId,
        customerAddress: {
          address1: addressData.address1,
          address2: addressData.address2,
          city: addressData.city,
          province: addressData.province,
          zip: addressData.zip,
          country: addressData.country,
          phone: addressData.phone,
        },
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    if (data.customerAddressCreate.userErrors.length > 0) {
      throw new Error(data.customerAddressCreate.userErrors.map((e: any) => e.message).join(", "))
    }

    return data.customerAddressCreate.customerAddress
  } catch (error) {
    console.error("Error adding customer address:", error)
    throw new Error(`No se pudo añadir la dirección: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para eliminar una dirección de cliente
export async function deleteCustomerAddress(addressId: string) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const DELETE_CUSTOMER_ADDRESS = `
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
    const formattedId = addressId.includes("gid://") ? addressId : `gid://shopify/MailingAddress/${addressId}`

    const { data, errors } = await shopifyFetch({
      query: DELETE_CUSTOMER_ADDRESS,
      variables: {
        id: formattedId,
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    if (data.customerAddressDelete.userErrors.length > 0) {
      throw new Error(data.customerAddressDelete.userErrors.map((e: any) => e.message).join(", "))
    }

    return data.customerAddressDelete.deletedCustomerAddressId
  } catch (error) {
    console.error("Error deleting customer address:", error)
    throw new Error(`No se pudo eliminar la dirección: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para establecer una dirección como predeterminada
export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const SET_DEFAULT_CUSTOMER_ADDRESS = `
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
    const formattedAddressId = addressId.includes("gid://") ? addressId : `gid://shopify/MailingAddress/${addressId}`

    const { data, errors } = await shopifyFetch({
      query: SET_DEFAULT_CUSTOMER_ADDRESS,
      variables: {
        customerId: formattedCustomerId,
        addressId: formattedAddressId,
      },
    })

    if (errors) {
      console.error("GraphQL Errors:", errors)
      throw new Error(`GraphQL Errors: ${errors.map((e) => e.message).join(", ")}`)
    }

    if (data.customerDefaultAddressUpdate.userErrors.length > 0) {
      throw new Error(data.customerDefaultAddressUpdate.userErrors.map((e: any) => e.message).join(", "))
    }

    return data.customerDefaultAddressUpdate.customer
  } catch (error) {
    console.error("Error setting default customer address:", error)
    throw new Error(
      `No se pudo establecer la dirección predeterminada: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
