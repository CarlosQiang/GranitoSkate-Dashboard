import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { DashboardStats } from "@/components/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { SalesOverview } from "@/components/sales-overview"
import { InventoryStatus } from "@/components/inventory-status"
// Importar el componente InitStatus
import { InitStatus } from "@/components/init-status"

export const dynamic = "force-dynamic"
export const revalidate = 0

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="mt-1 h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<StatsLoading />}>
            <DashboardStats />
          </Suspense>

          {/* Gráfico de visión general de ventas */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Visión general de ventas</CardTitle>
              <CardDescription>Tendencia de ventas de los últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <SalesOverview />
              </Suspense>
            </CardContent>
          </Card>

          {/* Añadir el componente InitStatus al principio del contenido de la página */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <InitStatus />
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Pedidos recientes</CardTitle>
                <CardDescription>Los últimos 5 pedidos de tu tienda</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  }
                >
                  <RecentOrders />
                </Suspense>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos recientes</CardTitle>
                <CardDescription>Los últimos productos añadidos</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  }
                >
                  <RecentProducts />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Estado del inventario */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del inventario</CardTitle>
              <CardDescription>Productos con stock bajo o agotados</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                <InventoryStatus />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de ventas</CardTitle>
              <CardDescription>Datos detallados sobre el rendimiento de ventas</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <iframe src="/dashboard/analytics" className="w-full h-full border-0" title="Análisis de ventas" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informes</CardTitle>
              <CardDescription>Informes detallados sobre tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Informe de ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Resumen de ventas por período</p>
                    <div className="mt-2 flex justify-end">
                      <a href="/dashboard/reports/sales" className="text-sm text-primary hover:underline">
                        Ver informe
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Informe de inventario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Estado actual del inventario</p>
                    <div className="mt-2 flex justify-end">
                      <a href="/dashboard/reports/inventory" className="text-sm text-primary hover:underline">
                        Ver informe
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Informe de clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Análisis de clientes y compras</p>
                    <div className="mt-2 flex justify-end">
                      <a href="/dashboard/reports/customers" className="text-sm text-primary hover:underline">
                        Ver informe
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Informe de marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Efectividad de campañas y promociones</p>
                    <div className="mt-2 flex justify-end">
                      <a href="/dashboard/reports/marketing" className="text-sm text-primary hover:underline">
                        Ver informe
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Alertas y notificaciones importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-md border p-4">
                  <div className="rounded-full bg-primary/20 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nuevo pedido recibido</p>
                    <p className="text-sm text-muted-foreground">
                      Has recibido un nuevo pedido (#12345) por valor de 89,99€
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-md border p-4">
                  <div className="rounded-full bg-yellow-500/20 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-yellow-500"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Stock bajo</p>
                    <p className="text-sm text-muted-foreground">
                      El producto "Tabla Skate Pro" tiene menos de 5 unidades en stock
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-md border p-4">
                  <div className="rounded-full bg-green-500/20 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Promoción finalizada</p>
                    <p className="text-sm text-muted-foreground">
                      La promoción "Descuento de verano" ha finalizado con éxito
                    </p>
                    <p className="text-xs text-muted-foreground">Ayer</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
