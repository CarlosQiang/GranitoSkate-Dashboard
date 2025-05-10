import { shopifyFetch } from "@/lib/shopify"

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  ordersCount: number
  totalSpent: string
  addresses: {
    edges: {
      node: {
        id: string
        address1: string
        address2: string
        city: string
        province: string
        country: string
        zip: string
      }
    }[]
  }
}

// Consulta para obtener clientes
const GET_CUSTOMERS = `
  query GetCustomers($first: Int!, $after: String) {
    customers(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          firstName
          lastName
          email
          phone
          ordersCount
          totalSpent
          addresses(first: 1) {
            edges {
              node {
                id
                address1
                address2
                city
                province
                country
                zip
              }
            }
          }
        }
      }
    }
  }
`

// Función para obtener clientes
export async function getCustomers(
  first = 10,
  after?: string,
): Promise<{
  customers: Customer[]
  pageInfo: { hasNextPage: boolean; endCursor: string }
}> {
  try {
    const data = await shopifyFetch({
      query: GET_CUSTOMERS,
      variables: { first, after },
    })

    const customers = data.customers.edges.map((edge: any) => edge.node)
    const pageInfo = data.customers.pageInfo

    return { customers, pageInfo }
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    throw error
  }
}

// Consulta para obtener un cliente por ID
const GET_CUSTOMER_BY_ID = `
  query GetCustomerById($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      email
      phone
      ordersCount
      totalSpent
      addresses(first: 5) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            country
            zip
          }
        }
      }
      orders(first: 5) {
        edges {
          node {
            id
            name
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
          }
        }
      }
    }
  }
`

// Función para obtener un cliente por ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const data = await shopifyFetch({
      query: GET_CUSTOMER_BY_ID,
      variables: { id },
    })

    return data.customer
  } catch (error) {
    console.error("Error al obtener el cliente:", error)
    throw error
  }
}
