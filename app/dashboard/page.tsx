import { Suspense } from "react"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu tienda Shopify</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardCards />
      </Suspense>
    </div>
  )
}
