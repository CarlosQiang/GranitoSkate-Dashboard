import { shopifyFetch } from "@/lib/shopify"

// Función para obtener todos los pedidos
export async function fetchOrders(limit = 50) {
  try {
    const query = `
      query {
        orders(first: ${limit}) {
          edges {
            node {
              id
              name
              email
              phone
              processedAt
              displayFulfillmentStatus
              displayFinancialStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    return (
      response.data?.orders?.edges?.map((edge) => {
        const node = edge.node
        return {
          ...node,
          totalPrice: node.totalPriceSet?.shopMoney?.amount || "0",
          currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
        }
      }) || []
    )
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    throw error
  }
}

// Función para obtener un pedido por ID
export async function fetchOrderById(id: string) {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Order/${id}`

    const query = `
      query {
        order(id: "${formattedId}") {
          id
          name
          email
          phone
          processedAt
          displayFulfillmentStatus
          displayFinancialStatus
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
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            id
            firstName
            lastName
            email
            phone
          }
          shippingAddress {
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  title
                  sku
                  price
                  product {
                    id
                  }
                }
                originalUnitPriceSet {
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

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    const order = response.data?.order
    if (!order) {
      throw new Error("Pedido no encontrado")
    }

    // Formatear los datos del pedido
    const formattedOrder = {
      ...order,
      subtotalPrice: order.subtotalPriceSet?.shopMoney?.amount || "0",
      shippingPrice: order.totalShippingPriceSet?.shopMoney?.amount || "0",
      taxPrice: order.totalTaxSet?.shopMoney?.amount || "0",
      totalPrice: order.totalPriceSet?.shopMoney?.amount || "0",
      currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      items:
        order.lineItems?.edges?.map((edge) => ({
          ...edge.node,
          price: edge.node.originalUnitPriceSet?.shopMoney?.amount || "0",
          currencyCode: edge.node.originalUnitPriceSet?.shopMoney?.currencyCode || "EUR",
          productId: edge.node.variant?.product?.id?.split("/").pop() || "",
        })) || [],
    }

    return formattedOrder
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    throw error
  }
}

// Función para obtener pedidos de un cliente
export async function fetchCustomerOrders(customerId: string) {
  try {
    const formattedId = customerId.includes("gid://") ? customerId : `gid://shopify/Customer/${customerId}`

    const query = `
      query {
        customer(id: "${formattedId}") {
          orders(first: 50) {
            edges {
              node {
                id
                name
                processedAt
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

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    return (
      response.data?.customer?.orders?.edges?.map((edge) => {
        const node = edge.node
        return {
          ...node,
          totalPrice: node.totalPriceSet?.shopMoney?.amount || "0",
          currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
        }
      }) || []
    )
  } catch (error) {
    console.error("Error al obtener pedidos del cliente:", error)
    throw error
  }
}

// Función para obtener pedidos recientes
export async function fetchRecentOrders(limit = 5) {
  try {
    return await fetchOrders(limit)
  } catch (error) {
    console.error("Error al obtener pedidos recientes:", error)
    return []
  }
}
