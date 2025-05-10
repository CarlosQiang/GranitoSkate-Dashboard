import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Analíticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>Ventas totales por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de ventas mensuales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top productos por ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de productos más vendidos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tráfico por Fuente</CardTitle>
            <CardDescription>Origen de las visitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de tráfico por fuente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuevos Clientes</CardTitle>
            <CardDescription>Clientes nuevos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de nuevos clientes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
