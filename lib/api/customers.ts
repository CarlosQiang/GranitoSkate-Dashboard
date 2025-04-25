import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCustomers(limit = 20) {
  const query = gql`
    query GetCustomers($limit: Int!) {
      customers(first: $limit, sortKey: CREATED_AT, reverse: true) {
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

  try {
    const data = await shopifyClient.request(query, { limit })

    return data.customers.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      email: edge.node.email,
      phone: edge.node.phone,
      ordersCount: edge.node.ordersCount,
      totalSpent: edge.node.totalSpent,
      createdAt: edge.node.createdAt,
    }))
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

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
        metafields(first: 20) {
          edges {
            node {
              id
              namespace
              key
              value
              type
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { id: `gid://shopify/Customer/${id}` })
    return data.customer
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    throw new Error(`Failed to fetch customer ${id}`)
  }
}

export async function updateCustomer(id: string, customerData: any) {
  const mutation = gql`
    mutation CustomerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
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
        id: `gid://shopify/Customer/${id}`,
        ...customerData,
      },
    })

    if (data.customerUpdate.userErrors.length > 0) {
      throw new Error(data.customerUpdate.userErrors[0].message)
    }

    return data.customerUpdate.customer
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error)
    throw error
  }
}
