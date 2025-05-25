import { shopifyFetch } from "@/lib/shopify"

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
  ordersCount: number
  totalSpent: string
  tags: string[]
  addresses: Array<{
    id: string
    address1: string
    city: string
    country: string
    zip: string
  }>
}

// Función principal para obtener clientes
export async function fetchCustomers(limit = 50): Promise<Customer[]> {
  try {
    const query = `
      query {
        customers(first: ${limit}, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              createdAt
              updatedAt
              ordersCount
              totalSpent
              tags
              addresses {
                id
                address1
                city
                country
                zip
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      console.error("Error fetching customers:", response.errors)
      return []
    }

    return response.data?.customers?.edges?.map((edge: any) => edge.node) || []
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

// Función para obtener un cliente por ID
export async function fetchCustomerById(id: string): Promise<Customer | null> {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`

    const query = `
      query {
        customer(id: "${formattedId}") {
          id
          firstName
          lastName
          email
          phone
          createdAt
          updatedAt
          ordersCount
          totalSpent
          tags
          addresses {
            id
            address1
            city
            country
            zip
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.customer) {
      return null
    }

    return response.data.customer
  } catch (error) {
    console.error("Error fetching customer by ID:", error)
    return null
  }
}

// Función para actualizar un cliente
export async function updateCustomer(id: string, customerData: any): Promise<Customer | null> {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`

    const mutation = `
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

    const input = {
      id: formattedId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.customerUpdate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.customerUpdate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return response.data?.customerUpdate?.customer || null
  } catch (error) {
    console.error("Error updating customer:", error)
    throw error
  }
}

// Función para crear un cliente
export async function createCustomer(customerData: any) {
  try {
    const mutation = `
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

    const input = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      note: customerData.note || "",
      tags: customerData.tags || [],
    }

    // Añadir dirección si se proporciona
    if (customerData.address && customerData.address.address1) {
      input.addresses = [customerData.address]
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.customerCreate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.customerCreate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    // Extraer el ID numérico del ID global de Shopify
    const fullId = response.data?.customerCreate?.customer?.id
    const idParts = fullId.split("/")
    const newCustomerId = idParts[idParts.length - 1]

    // Si hay metafields, añadirlos en una segunda operación
    if (customerData.metafields && customerData.metafields.length > 0 && customerData.metafields[0].value) {
      await saveCustomerDNI(newCustomerId, customerData.metafields[0].value)
    }

    return {
      id: newCustomerId,
      ...response.data?.customerCreate?.customer,
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error(`Error al crear cliente: ${(error as Error).message}`)
  }
}

// Función para eliminar un cliente
export async function deleteCustomer(id: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    const mutation = `
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

    const variables = {
      input: {
        id: formattedId,
      },
    }

    const result = await shopifyFetch({
      query: mutation,
      variables: variables,
    })

    if (result.errors || result.data?.customerDelete?.userErrors?.length > 0) {
      const errorMessage = result.errors?.[0]?.message || result.data?.customerDelete?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return { success: true, id: result.data?.customerDelete?.deletedCustomerId }
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error)
    throw new Error(`Error al eliminar cliente: ${(error as Error).message}`)
  }
}

// Función para buscar clientes por DNI
export async function searchCustomersByDNI(dni: string) {
  try {
    // Buscar por metafield con namespace "customer" y key "dni"
    const query = `
      query {
        customers(first: 10, query: "tag:dni-${dni} OR metafield:customer.dni:${dni}") {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              metafields(first: 10) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyFetch({ query })

    if (!data || !data.customers || !data.customers.edges.length) {
      return []
    }

    return data.customers.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      email: edge.node.email,
      phone: edge.node.phone,
      metafields:
        edge.node.metafields?.edges.map((metaEdge: any) => ({
          namespace: metaEdge.node.namespace,
          key: metaEdge.node.key,
          value: metaEdge.node.value,
        })) || [],
    }))
  } catch (error) {
    console.error("Error searching customers by DNI:", error)
    return []
  }
}

// Función para guardar el DNI de un cliente
export async function saveCustomerDNI(customerId: string, dni: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${customerId}`
    }

    // Crear o actualizar metafield para DNI
    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            metafields(first: 10) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
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
        id: formattedId,
        metafields: [
          {
            namespace: "customer",
            key: "dni",
            value: dni,
            type: "single_line_text_field",
          },
        ],
        tags: [`dni-${dni}`],
      },
    }

    const result = await shopifyFetch({
      query: mutation,
      variables: variables,
    })

    if (result.errors || result.data?.customerUpdate?.userErrors?.length > 0) {
      const errorMessage = result.errors?.[0]?.message || result.data?.customerUpdate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return result.data?.customerUpdate?.customer
  } catch (error) {
    console.error("Error saving customer DNI:", error)
    throw new Error(`Error al guardar DNI: ${(error as Error).message}`)
  }
}

// Función para actualizar la dirección de un cliente
export async function updateCustomerAddress(customerId: string, addressData: any, isDefault = false) {
  try {
    // Formatear el ID correctamente
    let formattedId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${customerId}`
    }

    let mutation
    let variables

    if (addressData.id) {
      // Actualizar dirección existente
      mutation = `
        mutation customerAddressUpdate($customerAddressUpdatePayload: CustomerAddressUpdateInput!) {
          customerAddressUpdate(customerAddressUpdatePayload: $customerAddressUpdatePayload) {
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

      variables = {
        customerAddressUpdatePayload: {
          customerId: formattedId,
          id: addressData.id,
          address: {
            address1: addressData.address1,
            address2: addressData.address2,
            city: addressData.city,
            province: addressData.province,
            zip: addressData.zip,
            country: addressData.country,
            phone: addressData.phone,
          },
        },
      }
    } else {
      // Crear nueva dirección
      mutation = `
        mutation customerAddressCreate($customerAddressCreatePayload: CustomerAddressCreateInput!) {
          customerAddressCreate(customerAddressCreatePayload: $customerAddressCreatePayload) {
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

      variables = {
        customerAddressCreatePayload: {
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
        },
      }
    }

    const result = await shopifyFetch({
      query: mutation,
      variables: variables,
    })
    const operationName = addressData.id ? "customerAddressUpdate" : "customerAddressCreate"

    if (result.errors || result.data?.[operationName]?.userErrors?.length > 0) {
      const errorMessage = result.errors?.[0]?.message || result.data?.[operationName]?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    // Si es la dirección predeterminada, actualizarla
    if (isDefault) {
      const addressId = result.data?.[operationName]?.customerAddress?.id
      await setDefaultCustomerAddress(customerId, addressId)
    }

    return result.data?.[operationName]?.customerAddress
  } catch (error) {
    console.error("Error updating customer address:", error)
    throw new Error(`Error al actualizar dirección: ${(error as Error).message}`)
  }
}

// Función para eliminar la dirección de un cliente
export async function deleteCustomerAddress(customerId: string, addressId: string) {
  try {
    // Formatear el ID correctamente
    let formattedCustomerId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedCustomerId = `gid://shopify/Customer/${customerId}`
    }

    const mutation = `
      mutation customerAddressDelete($customerAddressDeletePayload: CustomerAddressDeleteInput!) {
        customerAddressDelete(customerAddressDeletePayload: $customerAddressDeletePayload) {
          deletedCustomerAddressId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        customerId: formattedCustomerId,
        id: addressId,
      },
    }

    const result = await shopifyFetch({
      query: mutation,
      variables: variables,
    })

    if (result.errors || result.data?.customerAddressDelete?.userErrors?.length > 0) {
      const errorMessage = result.errors?.[0]?.message || result.data?.customerAddressDelete?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return { success: true, id: result.data?.customerAddressDelete?.deletedCustomerAddressId }
  } catch (error) {
    console.error("Error deleting customer address:", error)
    throw new Error(`Error al eliminar dirección: ${(error as Error).message}`)
  }
}

// Función para establecer la dirección predeterminada de un cliente
export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  try {
    // Formatear el ID correctamente
    let formattedCustomerId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedCustomerId = `gid://shopify/Customer/${customerId}`
    }

    const mutation = `
      mutation customerDefaultAddressUpdate($customerDefaultAddressUpdatePayload: CustomerDefaultAddressUpdateInput!) {
        customerDefaultAddressUpdate(customerDefaultAddressUpdatePayload: $customerDefaultAddressUpdatePayload) {
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

    const variables = {
      input: {
        customerId: formattedCustomerId,
        addressId: addressId,
      },
    }

    const result = await shopifyFetch({
      query: mutation,
      variables: variables,
    })

    if (result.errors || result.data?.customerDefaultAddressUpdate?.userErrors?.length > 0) {
      const errorMessage =
        result.errors?.[0]?.message || result.data?.customerDefaultAddressUpdate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return result.data?.customerDefaultAddressUpdate?.customer
  } catch (error) {
    console.error("Error setting default customer address:", error)
    throw new Error(`Error al establecer dirección predeterminada: ${(error as Error).message}`)
  }
}

// Función para exportar clientes a CSV
export async function exportCustomersToCSV(limit = 50) {
  try {
    let allCustomers: any[] = []
    let hasNextPage = true
    let cursor = null

    // Obtener todos los clientes con paginación
    while (hasNextPage) {
      const result = await fetchCustomers({
        first: limit, // Máximo permitido por Shopify
        after: cursor,
      })

      allCustomers = [...allCustomers, ...result]
      hasNextPage = false // Assuming no pagination is needed for export
      cursor = null
    }

    // Convertir a formato CSV
    const headers = [
      "ID",
      "Nombre",
      "Apellido",
      "Email",
      "Teléfono",
      "Pedidos",
      "Total Gastado",
      "Fecha de Registro",
      "Email Verificado",
      "Dirección",
      "Ciudad",
      "Provincia",
      "País",
      "Código Postal",
      "DNI",
      "Etiquetas",
    ]

    const rows = allCustomers.map((customer) => {
      const dniMetafield = customer.metafields.find((m: any) => m.namespace === "customer" && m.key === "dni")

      return [
        customer.id,
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        customer.ordersCount,
        customer.totalSpent,
        new Date(customer.createdAt).toLocaleDateString(),
        customer.verifiedEmail ? "Sí" : "No",
        customer.defaultAddress?.address1 || "",
        customer.defaultAddress?.city || "",
        customer.defaultAddress?.province || "",
        customer.defaultAddress?.country || "",
        customer.defaultAddress?.zip || "",
        dniMetafield?.value || "",
        customer.tags.join(", "),
      ]
    })

    return { headers, rows }
  } catch (error) {
    console.error("Error exporting customers:", error)
    throw new Error(`Error al exportar clientes: ${(error as Error).message}`)
  }
}
