import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export interface CustomerFilters {
  query?: string
  sortKey?: string
  reverse?: boolean
  first?: number
  after?: string | null
}

export async function fetchCustomers(filters: CustomerFilters = {}) {
  try {
    const { query = "", sortKey = "CREATED_AT", reverse = false, first = 20, after = null } = filters

    const graphqlQuery = gql`
      query GetCustomers($query: String, $sortKey: CustomerSortKeys, $reverse: Boolean, $first: Int, $after: String) {
        customers(query: $query, sortKey: $sortKey, reverse: $reverse, first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              firstName
              lastName
              email
              phone
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              createdAt
              updatedAt
              verifiedEmail
              acceptsMarketing
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
              tags
              metafields(first: 10) {
                edges {
                  node {
                    id
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

    const variables = {
      query,
      sortKey,
      reverse,
      first,
      after,
    }

    const data = await shopifyClient.request(graphqlQuery, variables)

    // Verificar que los datos existen y tienen la estructura correcta
    if (!data || !data.customers) {
      console.warn("No se encontraron datos de clientes en la respuesta")
      return {
        customers: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    // Verificar que edges existe y es un array
    if (!data.customers.edges || !Array.isArray(data.customers.edges)) {
      console.warn("Los datos de clientes no tienen la estructura esperada")
      return {
        customers: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    return {
      customers: data.customers.edges.map((edge: any) => ({
        id: edge.node.id.split("/").pop(),
        firstName: edge.node.firstName || "",
        lastName: edge.node.lastName || "",
        email: edge.node.email || "",
        phone: edge.node.phone || "",
        ordersCount: edge.node.numberOfOrders || 0,
        totalSpent: edge.node.amountSpent || { amount: "0", currencyCode: "EUR" },
        createdAt: edge.node.createdAt,
        updatedAt: edge.node.updatedAt,
        verifiedEmail: edge.node.verifiedEmail || false,
        acceptsMarketing: edge.node.acceptsMarketing || false,
        defaultAddress: edge.node.defaultAddress || null,
        addresses: edge.node.addresses || [],
        tags: edge.node.tags || [],
        metafields:
          edge.node.metafields?.edges?.map((metaEdge: any) => ({
            id: metaEdge.node.id,
            namespace: metaEdge.node.namespace,
            key: metaEdge.node.key,
            value: metaEdge.node.value,
          })) || [],
        cursor: edge.cursor,
      })),
      pageInfo: data.customers.pageInfo || { hasNextPage: false, endCursor: null },
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error(`Error al obtener clientes: ${(error as Error).message}`)
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
      query GetCustomer($id: ID!) {
        customer(id: $id) {
          id
          firstName
          lastName
          email
          phone
          note
          createdAt
          updatedAt
          numberOfOrders
          verifiedEmail
          acceptsMarketing
          amountSpent {
            amount
            currencyCode
          }
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
          tags
          metafields(first: 20) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    `

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data || !data.customer) {
      throw new Error(`Cliente no encontrado: ${id}`)
    }

    // Transformar los datos para mantener la consistencia con el resto de la aplicación
    return {
      id: data.customer.id.split("/").pop(),
      firstName: data.customer.firstName || "",
      lastName: data.customer.lastName || "",
      email: data.customer.email || "",
      phone: data.customer.phone || "",
      note: data.customer.note || "",
      ordersCount: data.customer.numberOfOrders || 0,
      totalSpent: data.customer.amountSpent || { amount: "0", currencyCode: "EUR" },
      createdAt: data.customer.createdAt,
      updatedAt: data.customer.updatedAt,
      verifiedEmail: data.customer.verifiedEmail || false,
      acceptsMarketing: data.customer.acceptsMarketing || false,
      defaultAddress: data.customer.defaultAddress || null,
      addresses: data.customer.addresses || [],
      tags: data.customer.tags || [],
      metafields:
        data.customer.metafields?.edges?.map((edge: any) => ({
          id: edge.node.id,
          namespace: edge.node.namespace,
          key: edge.node.key,
          value: edge.node.value,
        })) || [],
    }
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    throw new Error(`Error al cargar cliente: ${(error as Error).message}`)
  }
}

export async function updateCustomer(id: string, customerData: any) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    const mutation = gql`
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
            note
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Preparar los datos para la API de Shopify
    const input = {
      id: formattedId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      note: customerData.note,
      tags: customerData.tags,
    }

    const variables = {
      input,
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.customerUpdate.userErrors && result.customerUpdate.userErrors.length > 0) {
      throw new Error(result.customerUpdate.userErrors[0].message)
    }

    return result.customerUpdate.customer
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
            phone
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Preparar los datos para la API de Shopify
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

    const variables = {
      input,
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.customerCreate.userErrors && result.customerCreate.userErrors.length > 0) {
      throw new Error(result.customerCreate.userErrors[0].message)
    }

    // Extraer el ID numérico del ID global de Shopify
    const fullId = result.customerCreate.customer.id
    const idParts = fullId.split("/")
    const newCustomerId = idParts[idParts.length - 1]

    // Si hay metafields, añadirlos en una segunda operación
    if (customerData.metafields && customerData.metafields.length > 0 && customerData.metafields[0].value) {
      await saveCustomerDNI(newCustomerId, customerData.metafields[0].value)
    }

    return {
      id: newCustomerId,
      ...result.customerCreate.customer,
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

    const result = await shopifyClient.request(mutation, variables)

    if (result.customerDelete.userErrors && result.customerDelete.userErrors.length > 0) {
      throw new Error(result.customerDelete.userErrors[0].message)
    }

    return { success: true, id: result.customerDelete.deletedCustomerId }
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error)
    throw new Error(`Error al eliminar cliente: ${(error as Error).message}`)
  }
}

export async function searchCustomersByDNI(dni: string) {
  try {
    // Buscar por metafield con namespace "customer" y key "dni"
    const query = gql`
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

    const data = await shopifyClient.request(query)

    if (!data || !data.customers || !data.customers.edges.length === 0) {
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

export async function saveCustomerDNI(customerId: string, dni: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${customerId}`
    }

    // Crear o actualizar metafield para DNI
    const mutation = gql`
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

    const result = await shopifyClient.request(mutation, variables)

    if (result.customerUpdate.userErrors && result.customerUpdate.userErrors.length > 0) {
      throw new Error(result.customerUpdate.userErrors[0].message)
    }

    return result.customerUpdate.customer
  } catch (error) {
    console.error("Error saving customer DNI:", error)
    throw new Error(`Error al guardar DNI: ${(error as Error).message}`)
  }
}

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
      mutation = gql`
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
      mutation = gql`
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

    const result = await shopifyClient.request(mutation, variables)
    const operationName = addressData.id ? "customerAddressUpdate" : "customerAddressCreate"

    if (result[operationName].userErrors && result[operationName].userErrors.length > 0) {
      throw new Error(result[operationName].userErrors[0].message)
    }

    // Si es la dirección predeterminada, actualizarla
    if (isDefault) {
      const addressId = result[operationName].customerAddress.id
      await setDefaultCustomerAddress(customerId, addressId)
    }

    return result[operationName].customerAddress
  } catch (error) {
    console.error("Error updating customer address:", error)
    throw new Error(`Error al actualizar dirección: ${(error as Error).message}`)
  }
}

export async function deleteCustomerAddress(customerId: string, addressId: string) {
  try {
    // Formatear el ID correctamente
    let formattedCustomerId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedCustomerId = `gid://shopify/Customer/${customerId}`
    }

    const mutation = gql`
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
      customerAddressDeletePayload: {
        customerId: formattedCustomerId,
        id: addressId,
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.customerAddressDelete.userErrors && result.customerAddressDelete.userErrors.length > 0) {
      throw new Error(result.customerAddressDelete.userErrors[0].message)
    }

    return { success: true, id: result.customerAddressDelete.deletedCustomerAddressId }
  } catch (error) {
    console.error("Error deleting customer address:", error)
    throw new Error(`Error al eliminar dirección: ${(error as Error).message}`)
  }
}

export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  try {
    // Formatear el ID correctamente
    let formattedCustomerId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedCustomerId = `gid://shopify/Customer/${customerId}`
    }

    const mutation = gql`
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
      customerDefaultAddressUpdatePayload: {
        customerId: formattedCustomerId,
        addressId: addressId,
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.customerDefaultAddressUpdate.userErrors && result.customerDefaultAddressUpdate.userErrors.length > 0) {
      throw new Error(result.customerDefaultAddressUpdate.userErrors[0].message)
    }

    return result.customerDefaultAddressUpdate.customer
  } catch (error) {
    console.error("Error setting default customer address:", error)
    throw new Error(`Error al establecer dirección predeterminada: ${(error as Error).message}`)
  }
}

export async function exportCustomersToCSV(filters: CustomerFilters = {}) {
  try {
    let allCustomers: any[] = []
    let hasNextPage = true
    let cursor = null

    // Obtener todos los clientes con paginación
    while (hasNextPage) {
      const result = await fetchCustomers({
        ...filters,
        first: 250, // Máximo permitido por Shopify
        after: cursor,
      })

      allCustomers = [...allCustomers, ...result.customers]
      hasNextPage = result.pageInfo.hasNextPage
      cursor = result.pageInfo.endCursor
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
        `${customer.totalSpent.amount} ${customer.totalSpent.currencyCode}`,
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
