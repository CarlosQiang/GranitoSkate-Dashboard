import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentOrders(limit = 5) {
  try {
    console.log(`Fetching ${limit} recent orders from Shopify...`)

    const query = gql`
      query GetRecentOrders($limit: Int!) {
        orders(first: $limit, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              displayFinancialStatus
              displayFulfillmentStatus
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

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.orders || !data.orders.edges) {
      console.error("Respuesta de pedidos incompleta:", data)
      return []
    }

    const orders = data.orders.edges.map((edge) => ({
      id: edge.node.id.split("/").pop(),
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      financialStatus: edge.node.displayFinancialStatus,
      fulfillmentStatus: edge.node.displayFulfillmentStatus,
      totalPrice: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
      currencyCode: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: edge.node.customer
        ? {
            firstName: edge.node.customer.firstName || "",
            lastName: edge.node.customer.lastName || "",
            email: edge.node.customer.email || "",
          }
        : null,
      items:
        edge.node.lineItems?.edges?.map((item) => ({
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

export async function fetchOrders(limit = 20) {
  return fetchRecentOrders(limit)
}

export async function fetchOrderById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Order/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Order/${id}`

    console.log(`Fetching order with ID: ${formattedId}`)

    const query = gql`
      query GetOrderById($id: ID!) {
        order(id: $id) {
          id
          name
          processedAt
          displayFinancialStatus
          displayFulfillmentStatus
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
                  price {
                    amount
                    currencyCode
                  }
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

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.order) {
      console.error(`Pedido no encontrado: ${id}`)
      throw new Error(`Pedido no encontrado: ${id}`)
    }

    const order = data.order
    return {
      id: order.id.split("/").pop(),
      name: order.name,
      processedAt: order.processedAt,
      financialStatus: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
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
          price: item.node.variant?.price?.amount || "0.00",
          currencyCode: item.node.variant?.price?.currencyCode || "EUR",
          productId: item.node.variant?.product?.id?.split("/").pop() || null,
          productTitle: item.node.variant?.product?.title || "",
        })) || [],
    }
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error(`Error al cargar el pedido: ${error.message}`)
  }
}
