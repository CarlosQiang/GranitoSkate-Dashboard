import { shopifyFetch } from "@/lib/shopify"

// Función para obtener pedidos recientes
export async function fetchRecentOrders(limit = 5) {
  try {
    const query = `
      query {
        orders(first: ${limit}, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFulfillmentStatus
              displayFinancialStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: {},
    })

    if (!response.data) {
      throw new Error("No se pudieron obtener los pedidos recientes")
    }

    return response.data.orders.edges.map(({ node }: any) => ({
      id: node.id.split("/").pop(),
      name: node.name,
      createdAt: node.createdAt,
      status: node.displayFulfillmentStatus,
      financialStatus: node.displayFinancialStatus,
      total: node.totalPriceSet?.shopMoney?.amount || "0",
      currency: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: node.customer ? `${node.customer.firstName} ${node.customer.lastName}` : "Cliente anónimo",
      email: node.customer?.email || "",
    }))
  } catch (error) {
    console.error("Error al obtener pedidos recientes:", error)
    return []
  }
}

// Función para obtener un pedido por ID
export async function fetchOrderById(id: string) {
  try {
    const query = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          displayFulfillmentStatus
          displayFinancialStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          subtotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalShippingPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalTaxSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            firstName
            lastName
            email
            phone
          }
          shippingAddress {
            address1
            address2
            city
            province
            zip
            country
          }
          lineItems(first: 20) {
            edges {
              node {
                title
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                variant {
                  title
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: { id: `gid://shopify/Order/${id}` },
    })

    if (!response.data || !response.data.order) {
      throw new Error(`No se pudo encontrar el pedido con ID: ${id}`)
    }

    const order = response.data.order
    return {
      id: order.id.split("/").pop(),
      name: order.name,
      createdAt: order.createdAt,
      status: order.displayFulfillmentStatus,
      financialStatus: order.displayFinancialStatus,
      total: order.totalPriceSet?.shopMoney?.amount || "0",
      subtotal: order.subtotalPriceSet?.shopMoney?.amount || "0",
      shipping: order.totalShippingPriceSet?.shopMoney?.amount || "0",
      tax: order.totalTaxSet?.shopMoney?.amount || "0",
      currency: order.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: order.customer
        ? {
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            phone: order.customer.phone,
          }
        : null,
      shippingAddress: order.shippingAddress
        ? {
            address1: order.shippingAddress.address1,
            address2: order.shippingAddress.address2,
            city: order.shippingAddress.city,
            province: order.shippingAddress.province,
            zip: order.shippingAddress.zip,
            country: order.shippingAddress.country,
          }
        : null,
      lineItems: order.lineItems.edges.map(({ node }: any) => ({
        title: node.title,
        quantity: node.quantity,
        price: node.originalUnitPriceSet?.shopMoney?.amount || "0",
        currency: node.originalUnitPriceSet?.shopMoney?.currencyCode || "EUR",
        variantTitle: node.variant?.title || "",
        imageUrl: node.variant?.image?.url || null,
      })),
    }
  } catch (error) {
    console.error(`Error al obtener el pedido con ID ${id}:`, error)
    return null
  }
}

// Añadiendo la función fetchCustomerOrders que faltaba
export async function fetchCustomerOrders(customerId: string) {
  try {
    const query = `
      query getCustomerOrders($customerId: ID!) {
        customer(id: $customerId) {
          orders(first: 10, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                name
                createdAt
                displayFulfillmentStatus
                displayFinancialStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: { customerId: `gid://shopify/Customer/${customerId}` },
    })

    if (!response.data || !response.data.customer) {
      throw new Error(`No se pudo encontrar el cliente con ID: ${customerId}`)
    }

    return response.data.customer.orders.edges.map(({ node }: any) => ({
      id: node.id.split("/").pop(),
      name: node.name,
      createdAt: node.createdAt,
      status: node.displayFulfillmentStatus,
      financialStatus: node.displayFinancialStatus,
      total: node.totalPriceSet?.shopMoney?.amount || "0",
      currency: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
    }))
  } catch (error) {
    console.error(`Error al obtener los pedidos del cliente ${customerId}:`, error)
    return []
  }
}
