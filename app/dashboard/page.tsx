import type { Metadata } from "next"
import DashboardStats from "@/components/dashboard-stats"

export const metadata: Metadata = {
  title: "Dashboard | GestionGranito",
  description: "Panel de administración para GestionGranito",
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <DashboardStats />
    </div>
  )
}
