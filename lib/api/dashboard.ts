import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchShopStats() {
  const query = gql`
    query GetShopStats {
      shop {
        name
        ordersCount
        customersCount
        productsCount
      }
    }
  `

  try {
    const data = await shopifyClient.request(query)

    // Calcular ingresos totales (esto es un ejemplo, en una implementación real
    // se obtendría de la API de Shopify)
    const totalRevenue = "€12,345.67"

    return {
      totalOrders: data.shop.ordersCount,
      totalCustomers: data.shop.customersCount,
      totalProducts: data.shop.productsCount,
      totalRevenue,
    }
  } catch (error) {
    console.error("Error fetching shop stats:", error)
    return {
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalRevenue: "€0.00",
    }
  }
}
