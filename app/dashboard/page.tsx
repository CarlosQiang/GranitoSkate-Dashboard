"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, ShoppingBag, Tag, Euro, AlertTriangle, Percent } from "lucide-react"
import { SalesOverview } from "@/components/sales-overview"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { InventoryStatus } from "@/components/inventory-status"
import { DatabaseStatus } from "@/components/database-status"
import { SyncAllData } from "@/components/sync-all-data"

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
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`)
      }

      const data = await response.json()

      console.log("✅ Dashboard data loaded successfully:", data)
      console.log(
        `📊 Productos: ${data.allProducts?.length || 0}, Pedidos: ${data.allOrders?.length || 0}, Promociones: ${data.allPromotions?.length || 0}`,
      )

      setDashboardData(data)
    } catch (err) {
      console.error("❌ Error loading dashboard:", err)
      setError(err instanceof Error ? err.message : "Error loading dashboard")
      setDashboardData({
        stats: {
          totalSales: "0.00",
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalCollections: 0,
          totalPromotions: 0,
          totalInventory: 0,
          currency: "EUR",
        },
        recentOrders: [],
        recentProducts: [],
        salesOverview: [],
        inventoryStatus: {
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
        },
        allProducts: [],
        allOrders: [],
        allCustomers: [],
        allCollections: [],
        allPromotions: [],
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-2">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bienvenido al panel de administración de GranitoSkate
          </p>
        </div>
        <Button onClick={loadDashboardData} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar Datos
        </Button>
      </div>

      {error && (
        <Card className="border-l-4 border-amber-500 bg-amber-50">
          <CardContent className="pt-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-800 break-words">{error}</p>
              <p className="text-xs text-amber-700 mt-1">
                Los datos pueden estar incompletos. Puedes intentar actualizar o continuar con los datos disponibles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Stats cards - responsive grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <Euro className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">€{dashboardData?.stats?.totalSales || "0.00"}</div>
              <p className="text-xs sm:text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{dashboardData?.stats?.totalOrders || 0}</div>
              <p className="text-xs sm:text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{dashboardData?.stats?.totalCustomers || 0}</div>
              <p className="text-xs sm:text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Database className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{dashboardData?.stats?.totalProducts || 0}</div>
              <p className="text-xs sm:text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colecciones</CardTitle>
              <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{dashboardData?.stats?.totalCollections || 0}</div>
              <p className="text-xs sm:text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promociones</CardTitle>
              <Percent className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{dashboardData?.stats?.totalPromotions || 0}</div>
              <p className="text-xs sm:text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts section - responsive layout */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Tendencia de ventas</CardTitle>
              <CardDescription className="text-sm">Evolución de las ventas en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {dashboardData?.salesOverview && dashboardData.salesOverview.length > 0 ? (
                <SalesOverview data={dashboardData.salesOverview} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
                  No hay datos de ventas disponibles
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pedidos recientes</CardTitle>
              <CardDescription className="text-sm">Últimos pedidos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                <RecentOrders data={dashboardData.recentOrders} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
                  No hay pedidos recientes
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom section - responsive layout */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Productos recientes</CardTitle>
              <CardDescription className="text-sm">Los últimos productos añadidos a tu catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentProducts && dashboardData.recentProducts.length > 0 ? (
                <RecentProducts data={dashboardData.recentProducts} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
                  No hay productos recientes
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Estado del inventario</CardTitle>
              <CardDescription className="text-sm">Resumen del stock disponible</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.inventoryStatus ? (
                <InventoryStatus data={dashboardData.inventoryStatus} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
                  No hay datos de inventario
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Database status - full width on mobile */}
        <div className="mt-8">
          <DatabaseStatus onRefresh={loadDashboardData} />
        </div>

        {/* SOLO UNA sincronización completa al final */}
        <div className="mt-8">
          <SyncAllData onSyncComplete={loadDashboardData} />
        </div>
      </div>
    </div>
  )
}
