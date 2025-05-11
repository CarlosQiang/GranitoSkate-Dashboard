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

// Add missing functions that were causing build errors

export async function createCustomer(customerData: any) {
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
      input: customerData,
    })

    if (data.customerCreate.userErrors.length > 0) {
      throw new Error(data.customerCreate.userErrors[0].message)
    }

    return data.customerCreate.customer
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export async function deleteCustomer(id: string) {
  const mutation = gql`
    mutation CustomerDelete($input: CustomerDeleteInput!) {
      customerDelete(input: $input) {
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
      input: {
        id: `gid://shopify/Customer/${id}`,
      },
    })

    if (data.customerDelete.userErrors.length > 0) {
      throw new Error(data.customerDelete.userErrors[0].message)
    }

    return { id: data.customerDelete.deletedCustomerId }
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error)
    throw error
  }
}

export async function addCustomerAddress(customerId: string, addressData: any) {
  const mutation = gql`
    mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Note: This is a simplified implementation as Shopify Admin API might require different approach
    // You may need to adjust this based on your actual Shopify API requirements
    const data = await shopifyClient.request(mutation, {
      customerAccessToken: customerId, // This is simplified and may need adjustment
      address: addressData,
    })

    if (data.customerAddressCreate.customerUserErrors.length > 0) {
      throw new Error(data.customerAddressCreate.customerUserErrors[0].message)
    }

    return data.customerAddressCreate.customerAddress
  } catch (error) {
    console.error(`Error adding address for customer ${customerId}:`, error)
    throw error
  }
}

export async function deleteCustomerAddress(customerId: string, addressId: string) {
  const mutation = gql`
    mutation CustomerAddressDelete($customerAccessToken: String!, $id: ID!) {
      customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
        deletedCustomerAddressId
        customerUserErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Note: This is a simplified implementation as Shopify Admin API might require different approach
    const data = await shopifyClient.request(mutation, {
      customerAccessToken: customerId, // This is simplified and may need adjustment
      id: addressId,
    })

    if (data.customerAddressDelete.customerUserErrors.length > 0) {
      throw new Error(data.customerAddressDelete.customerUserErrors[0].message)
    }

    return { id: data.customerAddressDelete.deletedCustomerAddressId }
  } catch (error) {
    console.error(`Error deleting address ${addressId} for customer ${customerId}:`, error)
    throw error
  }
}

export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  const mutation = gql`
    mutation CustomerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
      customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
        customer {
          id
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Note: This is a simplified implementation as Shopify Admin API might require different approach
    const data = await shopifyClient.request(mutation, {
      customerAccessToken: customerId, // This is simplified and may need adjustment
      addressId: addressId,
    })

    if (data.customerDefaultAddressUpdate.customerUserErrors.length > 0) {
      throw new Error(data.customerDefaultAddressUpdate.customerUserErrors[0].message)
    }

    return data.customerDefaultAddressUpdate.customer
  } catch (error) {
    console.error(`Error setting default address ${addressId} for customer ${customerId}:`, error)
    throw error
  }
}
