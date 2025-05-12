import { fetchOrders, fetchOrderStats } from "./orders"
import { fetchProducts } from "./products"
import { fetchCollections } from "./collections"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener estadísticas generales de la tienda
export async function fetchShopStats() {
  try {
    const query = gql`
      query {
        shop {
          id
          name
          url
          myshopifyDomain
          primaryDomain {
            url
            host
          }
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
          currencyCode
          billingAddress {
            country
            countryCodeV2
          }
          productTypes(first: 10) {
            edges {
              node
            }
          }
          customerAccounts
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Obtener estadísticas adicionales
    const orderStats = await fetchOrderStats(30)

    // Obtener recuento de productos
    const productsQuery = gql`
      query {
        products(first: 1) {
          edges {
            node {
              id
            }
          }
        }
        shop {
          productsCount
        }
      }
    `

    const productsData = await shopifyClient.request(productsQuery)

    // Obtener recuento de clientes
    const customersQuery = gql`
      query {
        customers(first: 1) {
          edges {
            node {
              id
            }
          }
        }
        shop {
          customersCount
        }
      }
    `

    const customersData = await shopifyClient.request(customersQuery)

    return {
      shop: data.shop,
      stats: {
        orders: orderStats.totalOrders,
        recentOrders: orderStats.recentOrders,
        products: productsData.shop.productsCount,
        customers: customersData.shop.customersCount,
        totalSales: orderStats.totalSales,
        currencyCode: orderStats.currencyCode,
      },
    }
  } catch (error) {
    console.error("Error fetching shop stats:", error)
    throw new Error(`Error al cargar estadísticas: ${error.message}`)
  }
}

// Función para obtener datos para el panel de control
export async function fetchDashboardData() {
  try {
    // Obtener estadísticas generales
    const shopStats = await fetchShopStats()

    // Obtener pedidos recientes
    const recentOrders = await fetchOrders(5)

    // Obtener productos recientes
    const recentProducts = await fetchProducts(5)

    // Obtener colecciones recientes
    const recentCollections = await fetchCollections(5)

    return {
      stats: shopStats.stats,
      recentOrders: recentOrders.edges.map((edge) => edge.node),
      recentProducts: recentProducts.edges.map((edge) => edge.node),
      recentCollections: recentCollections.edges.map((edge) => edge.node),
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    throw new Error(`Error al cargar datos del panel de control: ${error.message}`)
  }
}

// Función para obtener estadísticas de ventas por período
export async function fetchSalesStats(period = "MONTH") {
  try {
    const query = gql`
      query GetSalesStats($period: ReportingPeriod!) {
        shopifyAnalytics {
          sales(first: 12, reverse: true, sortKey: ORDERS, period: $period) {
            edges {
              node {
                periodIndex
                totalSales {
                  amount
                  currencyCode
                }
                totalOrderCount
                averageOrderValue {
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
      period,
    }

    const data = await shopifyClient.request(query, variables)
    return data.shopifyAnalytics.sales.edges.map((edge) => edge.node)
  } catch (error) {
    console.error(`Error fetching sales stats for period ${period}:`, error)
    throw new Error(`Error al cargar estadísticas de ventas: ${error.message}`)
  }
}
