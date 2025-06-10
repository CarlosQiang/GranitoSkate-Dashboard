export async function fetchDashboardStats() {
  try {
    console.log("🔍 Obteniendo datos del dashboard...")

    const response = await fetch("/api/dashboard/summary", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener datos del dashboard: ${response.status}`)
    }

    const data = await response.json()
    console.log("📊 Datos del dashboard obtenidos:", data)
    return data
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)

    // Datos de fallback para evitar errores en la UI
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalCollections: 0,
      salesChange: 0,
      ordersChange: 0,
      customersChange: 0,
      productsChange: 0,
      currency: "EUR", // Añadir código de moneda por defecto
    }
  }
}
