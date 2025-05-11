import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Tipos para los filtros de pedidos
export type OrderFilter = {
  query?: string
  sortKey?: "PROCESSED_AT" | "TOTAL_PRICE" | "UPDATED_AT" | "ID" | "CREATED_AT"
  reverse?: boolean
  status?: "OPEN" | "CLOSED" | "CANCELLED" | "ANY"
  financialStatus?: string
  fulfillmentStatus?: string
  cursor?: string
  first?: number
}

// Función para obtener pedidos con filtros
export async function fetchOrders(filters: OrderFilter = {}) {
  try {
    console.log(`Fetching orders with filters:`, filters)

    const {
      query = "",
      sortKey = "PROCESSED_AT",
      reverse = true,
      status,
      financialStatus,
      fulfillmentStatus,
      cursor,
      first = 20,
    } = filters

    // Construir la consulta GraphQL
    const queryString = gql`
      query GetOrders(
        $first: Int!
        $query: String
        $sortKey: OrderSortKeys
        $reverse: Boolean
        $after: String
      ) {
        orders(
          first: $first
          query: $query
          sortKey: $sortKey
          reverse: $reverse
          after: $after
        ) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            cursor
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
                phone
              }
              lineItems(first: 5) {
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
              shippingAddress {
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              tags
            }
          }
        }
      }
    `

    // Construir la consulta de filtro
    const queryFilters = []

    if (status && status !== "ANY") {
      queryFilters.push(`status:${status}`)
    }

    if (financialStatus) {
      queryFilters.push(`financial_status:${financialStatus}`)
    }

    if (fulfillmentStatus) {
      queryFilters.push(`fulfillment_status:${fulfillmentStatus}`)
    }

    // Combinar los filtros con la consulta original
    const combinedQuery = [...queryFilters, query].filter(Boolean).join(" ")

    // Realizar la consulta a la API
    const data = await shopifyClient.request(queryString, {
      first,
      query: combinedQuery || null,
      sortKey,
      reverse,
      after: cursor || null,
    })

    if (!data || !data.orders || !data.orders.edges) {
      console.error("Respuesta de pedidos incompleta:", data)
      return { orders: [], pageInfo: null }
    }

    // Transformar los datos para la aplicación
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
            phone: edge.node.customer.phone || "",
          }
        : null,
      shippingAddress: edge.node.shippingAddress
        ? {
            address1: edge.node.shippingAddress.address1 || "",
            address2: edge.node.shippingAddress.address2 || "",
            city: edge.node.shippingAddress.city || "",
            province: edge.node.shippingAddress.province || "",
            country: edge.node.shippingAddress.country || "",
            zip: edge.node.shippingAddress.zip || "",
            phone: edge.node.shippingAddress.phone || "",
          }
        : null,
      items:
        edge.node.lineItems?.edges?.map((item) => ({
          title: item.node.title,
          quantity: item.node.quantity,
          price: item.node.variant?.price?.amount || "0.00",
          currencyCode: item.node.variant?.price?.currencyCode || "EUR",
          productId: item.node.variant?.product?.id?.split("/").pop() || null,
          productTitle: item.node.variant?.product?.title || "",
        })) || [],
      tags: edge.node.tags || [],
      cursor: edge.cursor,
    }))

    console.log(`Successfully fetched ${orders.length} orders`)

    return {
      orders,
      pageInfo: data.orders.pageInfo,
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error(`Error al cargar pedidos: ${error.message}`)
  }
}

// Función para obtener un pedido por ID
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
          billingAddress {
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
          tags
          note
          customAttributes {
            key
            value
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
      billingAddress: order.billingAddress
        ? {
            address1: order.billingAddress.address1 || "",
            address2: order.billingAddress.address2 || "",
            city: order.billingAddress.city || "",
            province: order.billingAddress.province || "",
            country: order.billingAddress.country || "",
            zip: order.billingAddress.zip || "",
            phone: order.billingAddress.phone || "",
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
      tags: order.tags || [],
      note: order.note || "",
      customAttributes: order.customAttributes || [],
    }
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error(`Error al cargar el pedido: ${error.message}`)
  }
}

// Función para actualizar un pedido
export async function updateOrder(id, data) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Order/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Order/${id}`

    console.log(`Updating order with ID: ${formattedId}`, data)

    const mutation = gql`
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Preparar los datos para la actualización
    const input = {
      id: formattedId,
      tags: data.tags,
      note: data.note,
      customAttributes: data.customAttributes?.map((attr) => ({
        key: attr.key,
        value: attr.value,
      })),
    }

    const result = await shopifyClient.request(mutation, { input })

    if (result.orderUpdate.userErrors.length > 0) {
      console.error("Errores al actualizar el pedido:", result.orderUpdate.userErrors)
      throw new Error(`Error al actualizar el pedido: ${result.orderUpdate.userErrors[0].message}`)
    }

    return {
      id: result.orderUpdate.order.id.split("/").pop(),
      success: true,
    }
  } catch (error) {
    console.error(`Error updating order ${id}:`, error)
    throw new Error(`Error al actualizar el pedido: ${error.message}`)
  }
}

// Función para obtener las etiquetas de pedidos
export async function fetchOrderTags() {
  try {
    const query = gql`
      query {
        shop {
          productTags(first: 100) {
            edges {
              node
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.shop || !data.shop.productTags) {
      return []
    }

    return data.shop.productTags.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching order tags:", error)
    return []
  }
}

// Implementación de fetchRecentOrders
export async function fetchRecentOrders(limit = 5) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/shopify/proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query getRecentOrders($first: Int!) {
            orders(first: $first, sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  name
                  createdAt
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
        `,
        variables: {
          first: limit,
        },
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener pedidos recientes: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Errores GraphQL:", result.errors)
      throw new Error(result.errors[0]?.message || "Error en la consulta GraphQL")
    }

    // Transformar los datos de GraphQL al formato que espera nuestra aplicación
    return result.data.orders.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(),
        orderNumber: node.name,
        date: node.createdAt,
        status: node.displayFinancialStatus,
        fulfillmentStatus: node.displayFulfillmentStatus,
        total: {
          amount: node.totalPriceSet.shopMoney.amount,
          currencyCode: node.totalPriceSet.shopMoney.currencyCode,
        },
        customer: node.customer
          ? {
              firstName: node.customer.firstName,
              lastName: node.customer.lastName,
              email: node.customer.email,
            }
          : null,
        items: node.lineItems.edges.map((item: any) => ({
          title: item.node.title,
          quantity: item.node.quantity,
        })),
      }
    })
  } catch (error) {
    console.error("Error en fetchRecentOrders:", error)
    throw error
  }
}
