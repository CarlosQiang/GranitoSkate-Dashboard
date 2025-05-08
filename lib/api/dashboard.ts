// Archivo simplificado para evitar dependencias de graphql-request
export async function fetchDashboardData() {
  return {
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    salesByDay: [],
    topProducts: [],
    recentOrders: [],
  }
}
