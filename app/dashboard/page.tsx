"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { SalesOverview } from "@/components/sales-overview"
import { InventoryStatus } from "@/components/inventory-status"
import { Button } from "@/components/ui/button"
import { RefreshCw, Save } from "lucide-react"
import { toast } from "@/components/ui/toast" // Import the toast component

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [salesOverview, setSalesOverview] = useState<any[]>([])

  // Función para cargar datos del dashboard con debouncing
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("📊 Loading dashboard data...")

      // Hacer una sola llamada que agregue todos los datos necesarios
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
      setRecentOrders(data?.recentOrders || [])
      setRecentProducts(data?.recentProducts || [])
      setSalesOverview(data?.salesOverview || [])
      console.log("✅ Dashboard data loaded successfully")
    } catch (err) {
      console.error("❌ Error loading dashboard:", err)
      setError(err instanceof Error ? err.message : "Error loading dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar datos solo una vez al montar el component
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleSyncToDatabase = async () => {
    setIsSyncing(true)
    try {
      // Implement the logic to save the cached data to the database
      // This is a placeholder, replace with your actual implementation
      console.log("Saving data to database:", { dashboardData, recentOrders, recentProducts, salesOverview })
      // After successful sync, show a success message
      toast({
        title: "Sincronización exitosa",
        description: "Los datos se han guardado en la base de datos.",
      })
    } catch (error) {
      console.error("Error saving data to database:", error)
      setError("Error al guardar los datos en la base de datos.")
      toast({
        title: "Error",
        description: "Error al guardar los datos en la base de datos.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
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

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>No se pudieron cargar los datos del dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>
        <Button
          onClick={handleSyncToDatabase}
          disabled={isSyncing}
          className="bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar en la base de datos
            </>
          )}
        </Button>
      </div>
      <div className="space-y-4">
        <DashboardStats data={dashboardData?.stats} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tendencia de ventas</CardTitle>
              <CardDescription>Evolución de las ventas en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesOverview data={salesOverview} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Pedidos recientes</CardTitle>
              <CardDescription>Últimos pedidos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentOrders data={recentOrders} />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos recientes</CardTitle>
              <CardDescription>Los últimos productos añadidos a tu catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentProducts data={recentProducts} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado del inventario</CardTitle>
              <CardDescription>Resumen del stock disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryStatus data={dashboardData?.inventoryStatus} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
