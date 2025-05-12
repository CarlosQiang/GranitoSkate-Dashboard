import { shopifyFetch } from "@/lib/shopify"

export async function fetchOrders({
  limit = 10,
  cursor = null,
  query = null,
  sortKey = "PROCESSED_AT",
  reverse = true,
}) {
  try {
    console.log(`Fetching orders with filters:`, { sortKey, reverse, first: limit })

    // Construir la consulta GraphQL
    const queryString = `
      query GetOrders($limit: Int!, $cursor: String, $query: String, $sortKey: OrderSortKeys, $reverse: Boolean) {
        orders(first: $limit, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              email
              phone
              processedAt
              financialStatus
              fulfillmentStatus
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
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    variant {
                      id
                      title
                      price
                      image {
                        url
                      }
                      product {
                        id
                        title
                        handle
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

    // Realizar la consulta a la API de Shopify
    const response = await shopifyFetch({
      query: queryString,
      variables: {
        limit,
        cursor,
        query,
        sortKey,
        reverse,
      },
    })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    // Procesar los datos recibidos
    const orders = response.data.orders.edges.map((edge) => {
      const order = edge.node

      return {
        id: order.id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        processedAt: order.processedAt,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        totalPrice: order.totalPriceSet?.shopMoney?.amount || "0.00",
        currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || "EUR",
        subtotalPrice: order.subtotalPriceSet?.shopMoney?.amount || "0.00",
        totalShippingPrice: order.totalShippingPriceSet?.shopMoney?.amount || "0.00",
        totalTax: order.totalTaxSet?.shopMoney?.amount || "0.00",
        customer: order.customer
          ? {
              id: order.customer.id,
              firstName: order.customer.firstName,
              lastName: order.customer.lastName,
              email: order.customer.email,
              phone: order.customer.phone,
            }
          : null,
        shippingAddress: order.shippingAddress,
        lineItems: order.lineItems.edges.map((edge) => {
          const item = edge.node
          return {
            title: item.title,
            quantity: item.quantity,
            totalPrice: item.originalTotalSet?.shopMoney?.amount || "0.00",
            variant: item.variant
              ? {
                  id: item.variant.id,
                  title: item.variant.title,
                  price: item.variant.price,
                  image: item.variant.image,
                  product: item.variant.product,
                }
              : null,
          }
        }),
      }
    })

    return {
      orders,
      pageInfo: response.data.orders.pageInfo,
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error(`Error al cargar pedidos: ${error.message}`)
  }
}

export async function fetchOrderById(id) {
  try {
    // Si el ID no incluye el prefijo gid://, añadirlo
    let fullId = id
    if (!id.includes("gid://")) {
      fullId = `gid://shopify/Order/${id}`
    }

    const queryString = `
      query GetOrderById($id: ID!) {
        order(id: $id) {
          id
          name
          email
          phone
          processedAt
          financialStatus
          fulfillmentStatus
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
          billingAddress {
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
                title
                quantity
                originalTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                variant {
                  id
                  title
                  price
                  image {
                    url
                  }
                  product {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
          note
          tags
        }
      }
    `

    const response = await shopifyFetch({
      query: queryString,
      variables: {
        id: fullId,
      },
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    if (!response.data.order) {
      throw new Error(`Pedido con ID ${id} no encontrado`)
    }

    const order = response.data.order

    return {
      id: order.id,
      name: order.name,
      email: order.email,
      phone: order.phone,
      processedAt: order.processedAt,
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      totalPrice: order.totalPriceSet?.shopMoney?.amount || "0.00",
      currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      subtotalPrice: order.subtotalPriceSet?.shopMoney?.amount || "0.00",
      totalShippingPrice: order.totalShippingPriceSet?.shopMoney?.amount || "0.00",
      totalTax: order.totalTaxSet?.shopMoney?.amount || "0.00",
      customer: order.customer
        ? {
            id: order.customer.id,
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            email: order.customer.email,
            phone: order.customer.phone,
          }
        : null,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      lineItems: order.lineItems.edges.map((edge) => {
        const item = edge.node
        return {
          title: item.title,
          quantity: item.quantity,
          totalPrice: item.originalTotalSet?.shopMoney?.amount || "0.00",
          variant: item.variant
            ? {
                id: item.variant.id,
                title: item.variant.title,
                price: item.variant.price,
                image: item.variant.image,
                product: item.variant.product,
              }
            : null,
        }
      }),
      note: order.note,
      tags: order.tags,
    }
  } catch (error) {
    console.error("Error fetching order by ID:", error)
    throw new Error(`Error al cargar el pedido: ${error.message}`)
  }
}

export async function updateOrder(id, data) {
  try {
    // Si el ID no incluye el prefijo gid://, añadirlo
    let fullId = id
    if (!id.includes("gid://")) {
      fullId = `gid://shopify/Order/${id}`
    }

    const input = {
      id: fullId,
      ...data,
    }

    const queryString = `
      mutation UpdateOrder($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: queryString,
      variables: {
        input,
      },
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    if (response.data.orderUpdate.userErrors.length > 0) {
      throw new Error(response.data.orderUpdate.userErrors[0].message)
    }

    return response.data.orderUpdate.order
  } catch (error) {
    console.error("Error updating order:", error)
    throw new Error(`Error al actualizar el pedido: ${error.message}`)
  }
}
