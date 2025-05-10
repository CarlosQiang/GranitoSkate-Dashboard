import { SimpleChart } from "@/components/ui/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Analíticas</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="traffic">Tráfico</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Tráfico por Fuente</CardTitle>
                <CardDescription>Origen de las visitas</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={{
                    labels: ["Directo", "Orgánico", "Social", "Referral", "Email"],
                    datasets: [
                      {
                        label: "Visitas",
                        data: [35, 25, 20, 15, 5],
                        backgroundColor: ["#d29a43", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                      },
                    ],
                  }}
                  title="Tráfico por Fuente"
                  type="pie"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nuevos Clientes</CardTitle>
                <CardDescription>Clientes nuevos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={{
                    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
                    datasets: [
                      {
                        label: "Nuevos clientes",
                        data: [45, 39, 60, 51, 46, 55, 70],
                        backgroundColor: "#10b981",
                        borderColor: "#10b981",
                      },
                    ],
                  }}
                  title="Nuevos Clientes"
                  type="line"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ventas</CardTitle>
              <CardDescription>Datos detallados de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenido detallado de ventas...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Tráfico</CardTitle>
              <CardDescription>Datos detallados de tráfico</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenido detallado de tráfico...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Clientes</CardTitle>
              <CardDescription>Datos detallados de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenido detallado de clientes...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
