// Función para obtener estadísticas de la tienda
export async function fetchShopStats() {
  try {
    // En un entorno real, esto haría una llamada a la API de Shopify
    // Por ahora, devolvemos datos de ejemplo
    return {
      totalRevenue: "€4,250.00",
      totalOrders: 42,
      averageOrderValue: "€101.19",
      conversionRate: "2.4%",
      topProducts: [
        { id: 1, name: "Skateboard Completo", sales: 15 },
        { id: 2, name: "Ruedas Pro", sales: 12 },
        { id: 3, name: "Trucks Premium", sales: 8 },
      ],
      recentOrders: [
        { id: "ORD-001", customer: "Juan Pérez", total: "€120.00", status: "Completado", date: "2023-04-01" },
        { id: "ORD-002", customer: "María García", total: "€85.50", status: "Enviado", date: "2023-04-02" },
        { id: "ORD-003", customer: "Carlos López", total: "€210.75", status: "Procesando", date: "2023-04-03" },
      ],
    }
  } catch (error) {
    console.error("Error fetching shop stats:", error)
    throw new Error("Failed to fetch shop statistics")
  }
}

// Función para obtener datos de ventas por período
export async function fetchSalesByPeriod(period = "month") {
  try {
    // En un entorno real, esto haría una llamada a la API de Shopify con el período especificado
    // Por ahora, devolvemos datos de ejemplo
    return {
      labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
      data: [1200, 1900, 1500, 1700],
    }
  } catch (error) {
    console.error("Error fetching sales by period:", error)
    throw new Error("Failed to fetch sales data")
  }
}

// Función para obtener datos de tráfico
export async function fetchTrafficSources() {
  try {
    // En un entorno real, esto haría una llamada a la API de Google Analytics o similar
    // Por ahora, devolvemos datos de ejemplo
    return {
      direct: 35,
      organic: 25,
      social: 20,
      email: 15,
      referral: 5,
    }
  } catch (error) {
    console.error("Error fetching traffic sources:", error)
    throw new Error("Failed to fetch traffic data")
  }
}
