import { fetchOrders } from "./orders"
import { fetchProducts } from "./products"
import { fetchCustomers } from "./customers"

export interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  topProducts: Array<{
    id: string
    title: string
    sales: number
    revenue: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Obtener datos de diferentes fuentes
    const [orders, products, customers] = await Promise.all([fetchOrders(250), fetchProducts(100), fetchCustomers(100)])

    // Calcular métricas básicas
    const totalRevenue = orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice || "0"), 0)
    const totalOrders = orders.length
    const totalCustomers = customers.length
    const totalProducts = products.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calcular crecimiento (simulado para demo)
    const revenueGrowth = Math.random() * 20 - 10 // -10% a +10%
    const ordersGrowth = Math.random() * 15 - 5 // -5% a +10%

    // Productos más vendidos (simulado)
    const topProducts = products.slice(0, 5).map((product, index) => ({
      id: product.id,
      title: product.title,
      sales: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }))

    // Ingresos mensuales (últimos 6 meses)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        month: date.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
        revenue: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 100) + 20,
      }
    })

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
      topProducts,
      monthlyRevenue,
    }
  } catch (error) {
    console.error("Error getting analytics data:", error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      topProducts: [],
      monthlyRevenue: [],
    }
  }
}
