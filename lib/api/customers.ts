import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export interface CustomerFilters {
  query?: string
  sortKey?: string
  reverse?: boolean
  first?: number
  after?: string
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

    if (!data || !data.customers || !data.customers.edges) {
      console.warn("No se encontraron clientes o la respuesta está incompleta")
      return { customers: [], pageInfo: { hasNextPage: false, endCursor: null } }
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
        defaultAddress: edge.node.defaultAddress || null,
        addresses: edge.node.addresses || [],
        tags: edge.node.tags || [],
        metafields:
          edge.node.metafields?.edges.map((metaEdge: any) => ({
            id: metaEdge.node.id,
            namespace: metaEdge.node.namespace,
            key: metaEdge.node.key,
            value: metaEdge.node.value,
          })) || [],
        cursor: edge.cursor,
      })),
      pageInfo: data.customers.pageInfo,
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error(`Error al obtener clientes: ${(error as Error).message}`)
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

    if (result.customerUpdate.userErrors.length > 0) {
      throw new Error(result.customerUpdate.userErrors[0].message)
    }

    return result.customerUpdate.customer
  } catch (error) {
    console.error("Error saving customer DNI:", error)
    throw new Error(`Error al guardar DNI: ${(error as Error).message}`)
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

// Mantener las funciones existentes
export async function fetchCustomerById(id: string) {
  // Implementación existente...
}

export async function updateCustomer(id: string, customerData: any) {
  // Implementación existente...
}

export async function createCustomer(customerData: any) {
  // Implementación existente...
}

export async function deleteCustomer(id: string) {
  // Implementación existente...
}
