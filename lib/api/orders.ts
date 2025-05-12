import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentOrders(limit = 10) {
  try {
    const query = gql`
      query GetOrders($first: Int!) {
        orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
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
              customer {
                firstName
                lastName
              }
            }
          }
        }
      }
    `

    const variables = {
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data || !data.orders || !data.orders.edges) {
      console.warn("No se encontraron pedidos o la respuesta está incompleta")
      return []
    }

    return data.orders.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      fulfillmentStatus: edge.node.fulfillmentStatus || "UNFULFILLED",
      financialStatus: edge.node.financialStatus || "PENDING",
      totalPrice: edge.node.totalPrice.amount,
      currencyCode: edge.node.totalPrice.currencyCode,
      customer: edge.node.customer
        ? {
            firstName: edge.node.customer.firstName || "",
            lastName: edge.node.customer.lastName || "",
          }
        : { firstName: "", lastName: "" },
    }))
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error(`Error al obtener pedidos: ${(error as Error).message}`)
  }
}

export async function fetchOrderById(id: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Order/${id}`
    }

    const query = gql`
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          name
          processedAt
          fulfillmentStatus
          financialStatus
          totalPrice {
            amount
            currencyCode
          }
          subtotalPrice {
            amount
            currencyCode
          }
          totalShippingPrice {
            amount
            currencyCode
          }
          totalTax {
            amount
            currencyCode
          }
          customer {
            id
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
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                  }
                }
                originalTotalPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data || !data.order) {
      throw new Error(`Pedido no encontrado: ${id}`)
    }

    // Transformar los datos para mantener la consistencia con el resto de la aplicación
    return {
      id: data.order.id.split("/").pop(),
      name: data.order.name,
      processedAt: data.order.processedAt,
      fulfillmentStatus: data.order.fulfillmentStatus || "UNFULFILLED",
      financialStatus: data.order.financialStatus || "PENDING",
      totalPrice: data.order.totalPrice.amount,
      currencyCode: data.order.totalPrice.currencyCode,
      subtotalPrice: data.order.subtotalPrice.amount,
      shippingPrice: data.order.totalShippingPrice.amount,
      taxPrice: data.order.totalTax.amount,
      customer: data.order.customer
        ? {
            id: data.order.customer.id.split("/").pop(),
            firstName: data.order.customer.firstName || "",
            lastName: data.order.customer.lastName || "",
            email: data.order.customer.email || "",
            phone: data.order.customer.phone || "",
          }
        : null,
      shippingAddress: data.order.shippingAddress || null,
      lineItems: data.order.lineItems.edges.map((edge: any) => ({
        id: edge.node.id.split("/").pop(),
        title: edge.node.title,
        quantity: edge.node.quantity,
        variant: edge.node.variant
          ? {
              id: edge.node.variant.id.split("/").pop(),
              title: edge.node.variant.title,
              price: edge.node.variant.price.amount,
              currencyCode: edge.node.variant.price.currencyCode,
              image: edge.node.variant.image ? edge.node.variant.image.url : null,
            }
          : null,
        totalPrice: edge.node.originalTotalPrice.amount,
        currencyCode: edge.node.originalTotalPrice.currencyCode,
      })),
    }
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error(`Error al cargar pedido: ${(error as Error).message}`)
  }
}

export async function fetchCustomerOrders(customerId: string, limit = 50) {
  try {
    // Formatear el ID correctamente
    let formattedId = customerId
    if (!customerId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Customer/${customerId}`
    }

    const query = gql`
      query GetCustomerOrders($customerId: ID!, $first: Int!) {
        customer(id: $customerId) {
          orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
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
        }
      }
    `

    const variables = {
      customerId: formattedId,
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data || !data.customer || !data.customer.orders || !data.customer.orders.edges) {
      console.warn("No se encontraron pedidos para este cliente o la respuesta está incompleta")
      return []
    }

    return data.customer.orders.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      fulfillmentStatus: edge.node.fulfillmentStatus || "UNFULFILLED",
      financialStatus: edge.node.financialStatus || "PENDING",
      totalPrice: edge.node.totalPrice.amount,
      currencyCode: edge.node.totalPrice.currencyCode,
    }))
  } catch (error) {
    console.error(`Error fetching customer orders for ${customerId}:`, error)
    throw new Error(`Error al obtener pedidos del cliente: ${(error as Error).message}`)
  }
}
