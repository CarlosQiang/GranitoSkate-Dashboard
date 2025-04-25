import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchShopStats() {
  // Consulta para obtener estadísticas básicas de la tienda
  const shopQuery = gql`
    query GetShopStats {
      shop {
        name
        ordersCount
        customersCount
        productsCount
      }
    }
  `

  // Consulta para obtener los pedidos recientes y calcular ingresos
  const ordersQuery = gql`
    query GetRecentOrders($limit: Int!) {
      orders(first: $limit, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            totalPrice {
              amount
              currencyCode
            }
            processedAt
          }
        }
      }
    }
  `

  try {
    // Ejecutar ambas consultas en paralelo
    const [shopData, ordersData] = await Promise.all([
      shopifyClient.request(shopQuery),
      shopifyClient.request(ordersQuery, { limit: 50 }), // Obtener los últimos 50 pedidos para calcular ingresos
    ])

    // Calcular ingresos totales
    let totalRevenue = 0
    let currencyCode = "EUR" // Valor predeterminado

    if (ordersData.orders && ordersData.orders.edges && ordersData.orders.edges.length > 0) {
      ordersData.orders.edges.forEach((edge: any) => {
        if (edge.node.totalPrice) {
          totalRevenue += Number.parseFloat(edge.node.totalPrice.amount)
          currencyCode = edge.node.totalPrice.currencyCode // Usar la moneda del último pedido
        }
      })
    }

    // Formatear el total de ingresos como una cadena de moneda
    const formattedRevenue = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currencyCode,
    }).format(totalRevenue)

    return {
      totalOrders: shopData.shop.ordersCount || 0,
      totalCustomers: shopData.shop.customersCount || 0,
      totalProducts: shopData.shop.productsCount || 0,
      totalRevenue: formattedRevenue,
    }
  } catch (error) {
    console.error("Error fetching shop stats:", error)

    // Devolver valores predeterminados en caso de error
    return {
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalRevenue: "€0.00",
      error: (error as Error).message,
    }
  }
}
