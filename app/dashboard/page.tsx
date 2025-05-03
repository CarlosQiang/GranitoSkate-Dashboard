import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { LoadingState } from "@/components/loading-state"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>

      {/* Eliminamos el ShopifyConnectionChecker de aquí ya que se mostrará en el layout */}

      <Suspense fallback={<LoadingState />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<LoadingState />}>
          <RecentOrders />
        </Suspense>
        <Suspense fallback={<LoadingState />}>
          <RecentProducts />
        </Suspense>
      </div>
    </div>
  )
}
