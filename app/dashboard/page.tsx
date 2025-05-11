import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { LoadingState } from "@/components/loading-state"

// Forzar revalidación en cada solicitud
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>
      </div>

      <Suspense fallback={<LoadingState message="Cargando estadísticas..." />}>
        <DashboardStats />
      </Suspense>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Pedidos recientes</TabsTrigger>
          <TabsTrigger value="products">Productos recientes</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="space-y-4">
          <Suspense fallback={<LoadingState message="Cargando pedidos..." />}>
            <RecentOrders />
          </Suspense>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Suspense fallback={<LoadingState message="Cargando productos..." />}>
            <RecentProducts />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
