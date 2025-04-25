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

    // En una implementación real, deberíamos obtener los ingresos totales
    // de la API de Shopify, pero esto requiere consultas adicionales
    // Por ahora, dejamos un valor vacío que se actualizará con datos reales
    return {
      totalOrders: data.shop.ordersCount,
      totalCustomers: data.shop.customersCount,
      totalProducts: data.shop.productsCount,
      totalRevenue: "€0.00", // Este valor se actualizará con datos reales
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
