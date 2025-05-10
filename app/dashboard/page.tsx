import { SimpleChart } from "@/components/ui/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { DashboardStats } from "@/components/dashboard-stats"

// Datos de ejemplo para evitar errores
const sampleData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Ventas",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: "#d29a43",
      borderColor: "#d29a43",
    },
  ],
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>Ventas totales por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart data={sampleData} title="Ventas Mensuales" type="line" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top productos por ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={{
                labels: ["Producto A", "Producto B", "Producto C", "Producto D", "Producto E"],
                datasets: [
                  {
                    label: "Unidades vendidas",
                    data: [120, 98, 85, 72, 65],
                    backgroundColor: ["#d29a43", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                  },
                ],
              }}
              title="Productos Más Vendidos"
              type="bar"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Recientes</CardTitle>
            <CardDescription>Últimos productos añadidos</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentProducts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
