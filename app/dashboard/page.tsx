import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { LoadingState } from "@/components/loading-state"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Forzar revalidación en cada solicitud
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>
        </div>
        <Button className="w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar datos
        </Button>
      </div>

      <Suspense fallback={<LoadingState message="Cargando estadísticas..." />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<LoadingState message="Cargando pedidos..." />}>
          <RecentOrders />
        </Suspense>
        <Suspense fallback={<LoadingState message="Cargando productos..." />}>
          <RecentProducts />
        </Suspense>
      </div>
    </div>
  )
}
