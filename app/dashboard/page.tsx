"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, ShoppingBag, Tag } from "lucide-react"
import { SalesOverview } from "@/components/sales-overview"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { InventoryStatus } from "@/components/inventory-status"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>({})
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncDetails, setSyncDetails] = useState<any>({})

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

  const handleSyncToDatabase = async () => {
    setIsSyncing(true)
    setSyncMessage(null)
    setSyncDetails({})
    const details = {}

    try {
      console.log("🔄 Iniciando sincronización con base de datos...")

      // Sincronizar productos
      if (dashboardData.totalProducts > 0) {
        console.log(`📦 Sincronizando ${dashboardData.totalProducts} productos...`)
        const productResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "productos",
            datos: dashboardData.recentProducts,
          }),
        })

        if (!productResponse.ok) {
          const errorData = await productResponse.json()
          throw new Error(errorData.mensaje || "Error al sincronizar productos")
        }

        const productResult = await productResponse.json()
        console.log("✅ Productos sincronizados:", productResult)
        details["productos"] = productResult.resultado
      }

      // Sincronizar pedidos
      if (dashboardData.totalOrders > 0) {
        console.log(`🛒 Sincronizando ${dashboardData.totalOrders} pedidos...`)
        const orderResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "pedidos",
            datos: dashboardData.recentOrders,
          }),
        })

        if (!orderResponse.ok) {
          console.warn("⚠️ Advertencia: No se pudieron sincronizar los pedidos")
        } else {
          const orderResult = await orderResponse.json()
          console.log("✅ Pedidos sincronizados:", orderResult)
          details["pedidos"] = orderResult.resultado
        }
      }

      // Sincronizar clientes
      if (dashboardData.totalCustomers > 0) {
        console.log(`👥 Sincronizando ${dashboardData.totalCustomers} clientes...`)
        const customerResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "clientes",
            datos: dashboardData.recentCustomers,
          }),
        })

        if (!customerResponse.ok) {
          console.warn("⚠️ Advertencia: No se pudieron sincronizar los clientes")
        } else {
          const customerResult = await customerResponse.json()
          console.log("✅ Clientes sincronizados:", customerResult)
          details["clientes"] = customerResult.resultado
        }
      }

      // Sincronizar colecciones
      if (dashboardData.totalCollections > 0) {
        console.log(`📚 Sincronizando ${dashboardData.totalCollections} colecciones...`)
        const collectionResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "colecciones",
            datos: dashboardData.recentCollections,
          }),
        })

        if (!collectionResponse.ok) {
          console.warn("⚠️ Advertencia: No se pudieron sincronizar las colecciones")
        } else {
          const collectionResult = await collectionResponse.json()
          console.log("✅ Colecciones sincronizadas:", collectionResult)
          details["colecciones"] = collectionResult.resultado
        }
      }

      setSyncDetails(details)
      setSyncMessage("✅ Datos sincronizados exitosamente con la base de datos")
      console.log("🎉 Sincronización completada")
    } catch (error) {
      console.error("❌ Error saving data to database:", error)
      setError("Error al guardar los datos en la base de datos.")
      setSyncMessage(
        `❌ Error al sincronizar los datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
      )
    } finally {
      setIsSyncing(false)
    }
  }

  const salesOverview = dashboardData.salesOverview || []
  const recentOrders = dashboardData.recentOrders || []
  const recentProducts = dashboardData.recentProducts || []

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
        <div className="flex items-center gap-4">
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
                <Database className="mr-2 h-4 w-4" />
                Sincronizar con Base de Datos
              </>
            )}
          </Button>
        </div>
      </div>

      {syncMessage && (
        <Card
          className={`border-l-4 ${syncMessage.includes("✅") ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
        >
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">{syncMessage}</p>
            {Object.keys(syncDetails).length > 0 && (
              <div className="text-xs space-y-1 mt-2">
                <p className="font-semibold">Detalles de sincronización:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(syncDetails).map(([tipo, resultado]: [string, any]) => (
                    <li key={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}: {resultado.insertados} insertados,{" "}
                      {resultado.actualizados} actualizados, {resultado.errores} errores
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <Database className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.stats?.totalSales || 0} {dashboardData?.stats?.currency || "EUR"}
              </div>
              <p className="text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.totalOrders || 0}</div>
              <p className="text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.totalCustomers || 0}</div>
              <p className="text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Database className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.totalProducts || 0}</div>
              <p className="text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colecciones</CardTitle>
              <Tag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.totalCollections || 0}</div>
              <p className="text-sm text-gray-500">+0% desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>

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
