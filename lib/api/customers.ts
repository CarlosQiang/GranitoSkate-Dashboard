import { shopifyFetch } from "@/lib/shopify"

export interface CustomerFilters {
  query?: string
  sortKey?: string
  reverse?: boolean
  first?: number
  after?: string | null
}

export async function fetchCustomers(filters: CustomerFilters = {}) {
  try {
    const { query = "", sortKey = "CREATED_AT", reverse = true, first = 50, after = null } = filters

    console.log("Fetching customers from Shopify with filters:", filters)

    const graphqlQuery = `
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

    console.log("Making GraphQL request with variables:", variables)

    const data = await shopifyFetch({
      query: graphqlQuery,
      variables,
    })

    console.log("Raw Shopify response:", data)

    if (data.errors) {
      console.error("GraphQL errors:", data.errors)
      throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`)
    }

    if (!data.data || !data.data.customers) {
      console.warn("No customers data in response")
      return {
        customers: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    if (!data.data.customers.edges || !Array.isArray(data.data.customers.edges)) {
      console.warn("Invalid customers edges structure")
      return {
        customers: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    const customers = data.data.customers.edges.map((edge: any) => {
      const customer = edge.node
      return {
        id: customer.id.split("/").pop(),
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        ordersCount: customer.numberOfOrders || 0,
        totalSpent: customer.amountSpent || { amount: "0", currencyCode: "EUR" },
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        verifiedEmail: customer.verifiedEmail || false,
        acceptsMarketing: customer.acceptsMarketing || false,
        defaultAddress: customer.defaultAddress || null,
        addresses: customer.addresses || [],
        tags: customer.tags || [],
        metafields:
          customer.metafields?.edges?.map((metaEdge: any) => ({
            id: metaEdge.node.id,
            namespace: metaEdge.node.namespace,
            key: metaEdge.node.key,
            value: metaEdge.node.value,
          })) || [],
        cursor: edge.cursor,
      }
    })

    console.log("Processed customers:", customers.length)

    return {
      customers,
      pageInfo: data.data.customers.pageInfo || { hasNextPage: false, endCursor: null },
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    // En lugar de lanzar el error, devolvemos una estructura vacía pero válida
    return {
      customers: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    }
  }
}

export async function fetchCustomerById(id: string) {
  try {
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${id}`
    }

    const query = `
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

    const variables = { id: formattedId }
    const data = await shopifyFetch({ query, variables })

    if (data.errors) {
      throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`)
    }

    if (!data.data || !data.data.customer) {
      throw new Error(`Cliente no encontrado: ${id}`)
    }

    const customer = data.data.customer
    return {
      id: customer.id.split("/").pop(),
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      note: customer.note || "",
      ordersCount: customer.numberOfOrders || 0,
      totalSpent: customer.amountSpent || { amount: "0", currencyCode: "EUR" },
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      verifiedEmail: customer.verifiedEmail || false,
      acceptsMarketing: customer.acceptsMarketing || false,
      defaultAddress: customer.defaultAddress || null,
      addresses: customer.addresses || [],
      tags: customer.tags || [],
      metafields:
        customer.metafields?.edges?.map((edge: any) => ({
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
