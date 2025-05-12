import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { DashboardStats } from "@/components/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"

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
          <TabsTrigger value="analytics" disabled>
            Analíticas
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Informes
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notificaciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<StatsLoading />}>
            <DashboardStats />
          </Suspense>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
