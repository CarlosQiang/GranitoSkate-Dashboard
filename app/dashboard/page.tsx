"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { SalesOverview } from "@/components/sales-overview"
import { InventoryStatus } from "@/components/inventory-status"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("📊 Loading dashboard data...")

      const response = await fetch("/api/dashboard/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
      console.log("✅ Dashboard data loaded successfully")
    } catch (err) {
      console.error("❌ Error loading dashboard:", err)
      setError(err instanceof Error ? err.message : "Error loading dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex-responsive-between">
          <div>
            <h2 className="heading-responsive">Dashboard</h2>
            <p className="caption-responsive mt-1">Cargando datos del panel...</p>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid-responsive-stats">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-responsive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-4"></div>
              </CardHeader>
              <CardContent>
                <div className="skeleton h-8 w-20 mb-2"></div>
                <div className="skeleton h-3 w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex-responsive-between">
          <div>
            <h2 className="heading-responsive">Dashboard</h2>
            <p className="caption-responsive mt-1">Error al cargar los datos</p>
          </div>
        </div>

        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>No se pudieron cargar los datos del dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="body-responsive text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="btn-responsive bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex-responsive-between">
        <div>
          <h2 className="heading-responsive">Dashboard</h2>
          <p className="caption-responsive mt-1">Bienvenido al panel de administración de GranitoSkate</p>
        </div>
        <div className="tablet-up">
          <p className="body-responsive text-muted-foreground">
            Última actualización: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive-stats">
        <DashboardStats data={dashboardData?.stats} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Sales Overview */}
        <Card className="col-span-full lg:col-span-4 card-responsive">
          <CardHeader className="card-header-responsive">
            <div>
              <CardTitle className="subheading-responsive">Ventas recientes</CardTitle>
              <CardDescription className="caption-responsive">
                Los últimos pedidos realizados en tu tienda
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesOverview data={dashboardData?.salesOverview} />
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-full lg:col-span-3 card-responsive">
          <CardHeader>
            <CardTitle className="subheading-responsive">Pedidos recientes</CardTitle>
            <CardDescription className="caption-responsive">Últimos pedidos procesados</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders data={dashboardData?.recentOrders} />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid-responsive-2">
        {/* Recent Products */}
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="subheading-responsive">Productos recientes</CardTitle>
            <CardDescription className="caption-responsive">
              Los últimos productos añadidos a tu catálogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentProducts data={dashboardData?.recentProducts} />
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="subheading-responsive">Estado del inventario</CardTitle>
            <CardDescription className="caption-responsive">Resumen del stock disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryStatus data={dashboardData?.inventoryStatus} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
