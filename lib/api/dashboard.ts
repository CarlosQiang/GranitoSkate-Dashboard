export async function fetchDashboardStats() {
  try {
    // Simulación de datos para el dashboard
    return {
      totalSales: 12500,
      totalOrders: 156,
      totalCustomers: 89,
      totalProducts: 45,
      recentOrders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          customer: "Juan Pérez",
          date: new Date().toISOString(),
          total: 125.99,
          status: "completed",
        },
        {
          id: "2",
          orderNumber: "ORD-002",
          customer: "María García",
          date: new Date().toISOString(),
          total: 89.5,
          status: "processing",
        },
        {
          id: "3",
          orderNumber: "ORD-003",
          customer: "Carlos Rodríguez",
          date: new Date().toISOString(),
          total: 210.75,
          status: "completed",
        },
      ],
      salesByMonth: [
        { month: "Ene", sales: 4500 },
        { month: "Feb", sales: 5200 },
        { month: "Mar", sales: 4800 },
        { month: "Abr", sales: 5800 },
        { month: "May", sales: 6000 },
        { month: "Jun", sales: 5400 },
        { month: "Jul", sales: 5900 },
        { month: "Ago", sales: 6500 },
        { month: "Sep", sales: 7000 },
        { month: "Oct", sales: 7200 },
        { month: "Nov", sales: 7800 },
        { month: "Dic", sales: 8500 },
      ],
      topProducts: [
        { name: "Producto A", sales: 45 },
        { name: "Producto B", sales: 38 },
        { name: "Producto C", sales: 31 },
        { name: "Producto D", sales: 28 },
        { name: "Producto E", sales: 25 },
      ],
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw new Error("No se pudieron cargar las estadísticas del dashboard")
  }
}

export async function fetchSalesData() {
  try {
    // Simulación de datos de ventas
    return {
      daily: [
        { date: "01/05/2023", sales: 450 },
        { date: "02/05/2023", sales: 520 },
        { date: "03/05/2023", sales: 480 },
        { date: "04/05/2023", sales: 580 },
        { date: "05/05/2023", sales: 600 },
        { date: "06/05/2023", sales: 540 },
        { date: "07/05/2023", sales: 590 },
      ],
      weekly: [
        { week: "Semana 1", sales: 3200 },
        { week: "Semana 2", sales: 3500 },
        { week: "Semana 3", sales: 3800 },
        { week: "Semana 4", sales: 4100 },
      ],
      monthly: [
        { month: "Ene", sales: 12500 },
        { month: "Feb", sales: 13200 },
        { month: "Mar", sales: 14800 },
        { month: "Abr", sales: 15800 },
        { month: "May", sales: 16000 },
        { month: "Jun", sales: 15400 },
      ],
    }
  } catch (error) {
    console.error("Error fetching sales data:", error)
    throw new Error("No se pudieron cargar los datos de ventas")
  }
}

export async function fetchCustomerStats() {
  try {
    // Simulación de datos de clientes
    return {
      newCustomers: 12,
      totalCustomers: 89,
      customerRetentionRate: 78,
      customersByRegion: [
        { region: "Madrid", customers: 35 },
        { region: "Barcelona", customers: 28 },
        { region: "Valencia", customers: 15 },
        { region: "Sevilla", customers: 11 },
      ],
      customerActivity: [
        { month: "Ene", active: 65, inactive: 10 },
        { month: "Feb", active: 68, inactive: 12 },
        { month: "Mar", active: 72, inactive: 8 },
        { month: "Abr", active: 75, inactive: 7 },
        { month: "May", active: 80, inactive: 9 },
        { month: "Jun", active: 82, inactive: 7 },
      ],
    }
  } catch (error) {
    console.error("Error fetching customer stats:", error)
    throw new Error("No se pudieron cargar las estadísticas de clientes")
  }
}
