import { shopifyFetch } from "@/lib/shopify"

export async function fetchRecentOrders(limit = 10) {
  try {
    console.log(`🔍 Fetching ${limit} recent orders from Shopify...`)

    const query = `
      query GetRecentOrders($limit: Int!) {
        orders(first: $limit, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
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
                id
                firstName
                lastName
                email
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      price
                      product {
                        title
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

    const response = await shopifyFetch({ query, variables: { limit } })

    // Verificar errores de GraphQL
    if (response.errors) {
      console.error("❌ GraphQL errors:", response.errors)
      throw new Error(`GraphQL Error: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (!response.data || !response.data.orders || !response.data.orders.edges) {
      console.error("❌ Respuesta de pedidos incompleta:", response)
      return []
    }

    const orders = response.data.orders.edges.map(({ node }) => ({
      id: node.id.split("/").pop(),
      name: node.name,
      processedAt: node.processedAt || node.createdAt,
      createdAt: node.createdAt,
      fulfillmentStatus: node.displayFulfillmentStatus || "UNFULFILLED",
      financialStatus: node.displayFinancialStatus || "PENDING",
      totalPrice: node.totalPriceSet?.shopMoney?.amount || "0.00",
      currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: node.customer
        ? {
            id: node.customer.id.split("/").pop(),
            firstName: node.customer.firstName || "",
            lastName: node.customer.lastName || "",
            email: node.customer.email || "",
          }
        : null,
      items:
        node.lineItems?.edges?.map((item) => ({
          title: item.node.title,
          quantity: item.node.quantity,
          price: item.node.variant?.price || "0.00",
          productTitle: item.node.variant?.product?.title || "",
        })) || [],
    }))

    console.log(`✅ Successfully fetched ${orders.length} orders`)
    return orders
  } catch (error) {
    console.error("❌ Error fetching recent orders:", error)
    throw new Error(`Error al cargar pedidos recientes: ${error.message}`)
  }
}

export async function fetchOrderById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Order/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Order/${id}`

    console.log(`Fetching order with ID: ${formattedId}`)

    const query = `
      query GetOrderById($id: ID!) {
        order(id: $id) {
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
            country
            zip
            phone
          }
          lineItems(first: 20) {
            edges {
              node {
                title
                quantity
                variant {
                  price
                  product {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query, variables: { id: formattedId } })

    if (!response.data || !response.data.order) {
      console.error(`Pedido no encontrado: ${id}`)
      throw new Error(`Pedido no encontrado: ${id}`)
    }

    const order = response.data.order
    return {
      id: order.id.split("/").pop(),
      name: order.name,
      processedAt: order.processedAt,
      displayFulfillmentStatus: order.displayFulfillmentStatus,
      displayFinancialStatus: order.displayFinancialStatus,
      totalPrice: order.totalPriceSet?.shopMoney?.amount || "0.00",
      subtotalPrice: order.subtotalPriceSet?.shopMoney?.amount || "0.00",
      shippingPrice: order.totalShippingPriceSet?.shopMoney?.amount || "0.00",
      taxPrice: order.totalTaxSet?.shopMoney?.amount || "0.00",
      currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: order.customer
        ? {
            firstName: order.customer.firstName || "",
            lastName: order.customer.lastName || "",
            email: order.customer.email || "",
            phone: order.customer.phone || "",
          }
        : null,
      shippingAddress: order.shippingAddress
        ? {
            address1: order.shippingAddress.address1 || "",
            address2: order.shippingAddress.address2 || "",
            city: order.shippingAddress.city || "",
            province: order.shippingAddress.province || "",
            country: order.shippingAddress.country || "",
            zip: order.shippingAddress.zip || "",
            phone: order.shippingAddress.phone || "",
          }
        : null,
      items:
        order.lineItems?.edges?.map((item) => ({
          title: item.node.title,
          quantity: item.node.quantity,
          price: item.node.variant?.price || "0.00",
          productId: item.node.variant?.product?.id?.split("/").pop() || null,
          productTitle: item.node.variant?.product?.title || "",
        })) || [],
    }
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error(`Error al cargar el pedido: ${error.message}`)
  }
}

// Añadir la función fetchCustomerOrders que falta
export async function fetchCustomerOrders(customerId: string, limit = 50) {
  try {
    // Limpiar y formatear el ID correctamente
    let cleanId = customerId
    if (customerId.includes("gid://shopify/Customer/")) {
      cleanId = customerId.split("/").pop() || customerId
    }

    const formattedId = `gid://shopify/Customer/${cleanId}`

    console.log(`🔍 Fetching orders for customer: ${formattedId} (original: ${customerId})`)

    const query = `
      query GetCustomerOrders($customerId: ID!, $first: Int!) {
        customer(id: $customerId) {
          id
          firstName
          lastName
          email
          orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                name
                processedAt
                createdAt
                displayFulfillmentStatus
                displayFinancialStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 3) {
                  edges {
                    node {
                      title
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      customerId: formattedId,
      first: limit,
    }

    const response = await shopifyFetch({ query, variables })

    if (!response.data) {
      console.error("No data in response:", response)
      throw new Error("No se recibieron datos de Shopify")
    }

    if (!response.data.customer) {
      console.error("Customer not found:", formattedId)
      throw new Error(`Cliente no encontrado: ${cleanId}`)
    }

    if (!response.data.customer.orders || !response.data.customer.orders.edges) {
      console.warn("Customer found but no orders:", response.data.customer)
      return []
    }

    const orders = response.data.customer.orders.edges.map(({ node }) => ({
      id: node.id.split("/").pop(),
      name: node.name,
      processedAt: node.processedAt || node.createdAt,
      displayFulfillmentStatus: node.displayFulfillmentStatus || "UNFULFILLED",
      displayFinancialStatus: node.displayFinancialStatus || "PENDING",
      totalPrice: node.totalPriceSet?.shopMoney?.amount || "0.00",
      currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      items:
        node.lineItems?.edges?.map((item) => ({
          title: item.node.title,
          quantity: item.node.quantity,
        })) || [],
    }))

    console.log(`✅ Successfully fetched ${orders.length} orders for customer ${cleanId}`)
    return orders
  } catch (error) {
    console.error(`❌ Error fetching customer orders for ${customerId}:`, error)
    throw new Error(`Error al obtener pedidos del cliente: ${error.message}`)
  }
}
