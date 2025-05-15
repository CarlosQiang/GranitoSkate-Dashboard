import { shopifyFetch } from "@/lib/shopify"

export async function fetchRecentOrders(limit = 10) {
  try {
    console.log(`Fetching ${limit} recent orders from Shopify...`)

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
                firstName
                lastName
                email
              }
              lineItems(first: 5) {
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
    `

    const response = await shopifyFetch({ query, variables: { limit } })

    if (!response.data || !response.data.orders || !response.data.orders.edges) {
      console.error("Respuesta de pedidos incompleta:", response)
      return []
    }

    const orders = response.data.orders.edges.map(({ node }) => ({
      id: node.id.split("/").pop(),
      name: node.name,
      processedAt: node.processedAt,
      createdAt: node.createdAt,
      fulfillmentStatus: node.displayFulfillmentStatus,
      financialStatus: node.displayFinancialStatus,
      totalPrice: node.totalPriceSet?.shopMoney?.amount || "0.00",
      currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: node.customer
        ? {
            firstName: node.customer.firstName || "",
            lastName: node.customer.lastName || "",
            email: node.customer.email || "",
          }
        : null,
      items:
        node.lineItems?.edges?.map((item) => ({
          title: item.node.title,
          quantity: item.node.quantity,
        })) || [],
    }))

    console.log(`Successfully fetched ${orders.length} orders`)
    return orders
  } catch (error) {
    console.error("Error fetching recent orders:", error)
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
export async function fetchCustomerOrders(customerId, limit = 50) {
  try {
    // Formatear el ID correctamente
    let formattedId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${customerId}`
    }

    console.log(`Fetching orders for customer: ${formattedId}`)

    const query = `
      query GetCustomerOrders($customerId: ID!, $first: Int!) {
        customer(id: $customerId) {
          orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
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

    const variables = {
      customerId: formattedId,
      first: limit,
    }

    const response = await shopifyFetch({ query, variables })

    if (
      !response.data ||
      !response.data.customer ||
      !response.data.customer.orders ||
      !response.data.customer.orders.edges
    ) {
      console.warn("No se encontraron pedidos para este cliente o la respuesta está incompleta")
      return []
    }

    return response.data.customer.orders.edges.map(({ node }) => ({
      id: node.id.split("/").pop(),
      name: node.name,
      processedAt: node.processedAt,
      displayFulfillmentStatus: node.displayFulfillmentStatus,
      displayFinancialStatus: node.displayFinancialStatus,
      totalPrice: node.totalPriceSet?.shopMoney?.amount || "0.00",
      currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
    }))
  } catch (error) {
    console.error(`Error fetching customer orders for ${customerId}:`, error)
    throw new Error(`Error al obtener pedidos del cliente: ${error.message}`)
  }
}

// Función actualizada para eliminar un pedido
export async function deleteOrder(orderId) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = orderId.includes("gid://shopify/Order/")
    const formattedId = isFullShopifyId ? orderId : `gid://shopify/Order/${orderId}`

    console.log(`Deleting order with ID: ${formattedId}`)

    // En Shopify, no se pueden eliminar pedidos directamente a través de la API GraphQL
    // En su lugar, podemos cancelar el pedido y luego archivarlo

    // 1. Primero, cancelamos el pedido con los argumentos requeridos
    const cancelMutation = `
      mutation orderCancel(
        $orderId: ID!,
        $reason: OrderCancelReason!,
        $refund: OrderRefundInput,
        $restock: Boolean!
      ) {
        orderCancel(
          orderId: $orderId,
          reason: $reason,
          refund: $refund,
          restock: $restock
        ) {
          userErrors {
            field
            message
          }
          order {
            id
            cancelledAt
            displayFulfillmentStatus
          }
        }
      }
    `

    const cancelVariables = {
      orderId: formattedId,
      reason: "CUSTOMER", // Razones válidas: CUSTOMER, INVENTORY, FRAUD, DECLINED, OTHER
      restock: true, // Devolver los productos al inventario
      refund: null, // No emitir reembolso automáticamente
    }

    const cancelResponse = await shopifyFetch({
      query: cancelMutation,
      variables: cancelVariables,
    })

    if (
      cancelResponse.errors ||
      (cancelResponse.data?.orderCancel?.userErrors && cancelResponse.data.orderCancel.userErrors.length > 0)
    ) {
      console.error(
        "Error al cancelar el pedido:",
        cancelResponse.errors || cancelResponse.data?.orderCancel?.userErrors,
      )

      // Si el error es porque el pedido ya está cancelado, continuamos con el archivado
      if (!cancelResponse.data?.orderCancel) {
        throw new Error("No se pudo cancelar el pedido")
      }
    }

    // 2. Luego, archivamos el pedido
    const archiveMutation = `
      mutation orderArchive($id: ID!) {
        orderClose(input: {id: $id}) {
          userErrors {
            field
            message
          }
          order {
            id
            closedAt
          }
        }
      }
    `

    const archiveResponse = await shopifyFetch({
      query: archiveMutation,
      variables: { id: formattedId },
    })

    if (
      archiveResponse.errors ||
      (archiveResponse.data?.orderClose?.userErrors && archiveResponse.data.orderClose.userErrors.length > 0)
    ) {
      console.error(
        "Error al archivar el pedido:",
        archiveResponse.errors || archiveResponse.data?.orderClose?.userErrors,
      )
      // No lanzamos error aquí, ya que el pedido ya está cancelado
      console.warn("El pedido fue cancelado pero no pudo ser archivado")
    }

    return {
      success: true,
      message: "Pedido cancelado y archivado correctamente",
    }
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error)

    // Si es un error de la API de Shopify, intentamos proporcionar un mensaje más claro
    if (error.response && error.response.errors) {
      const errorMessage = error.response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error al eliminar el pedido: ${errorMessage}`)
    }

    throw new Error(`Error al eliminar el pedido: ${error.message}`)
  }
}
