"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, ShoppingBag, Tag, Euro, AlertTriangle, Percent, Trash2 } from "lucide-react"
import { SalesOverview } from "@/components/sales-overview"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { InventoryStatus } from "@/components/inventory-status"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
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
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`)
      }

      const data = await response.json()

      // Verificar que los datos estén completos
      console.log("✅ Dashboard data loaded successfully:", data)
      console.log(
        `📊 Productos: ${data.allProducts?.length || 0}, Pedidos: ${data.allOrders?.length || 0}, Promociones: ${data.allPromotions?.length || 0}`,
      )

      setDashboardData(data)
    } catch (err) {
      console.error("❌ Error loading dashboard:", err)
      setError(err instanceof Error ? err.message : "Error loading dashboard")
      // Establecer datos por defecto en caso de error
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

  const handleSyncToDatabase = async () => {
    setIsSyncing(true)
    setSyncMessage(null)
    setSyncDetails({})

    try {
      console.log("🔄 Iniciando sincronización completa con limpieza...")

      // Usar la nueva API de sincronización completa con limpieza
      const response = await fetch("/api/sync/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dashboardData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error en la sincronización completa")
      }

      const result = await response.json()
      console.log("✅ Sincronización completa exitosa:", result)

      setSyncDetails(result.results)
      setSyncMessage(
        "✅ Sincronización completa exitosa - Base de datos limpiada y actualizada con datos frescos de Shopify",
      )
    } catch (error) {
      console.error("❌ Error en sincronización completa:", error)
      setError("Error al sincronizar los datos con la base de datos.")
      setSyncMessage(`❌ Error en la sincronización: ${error instanceof Error ? error.message : "Error desconocido"}`)
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>
          <Button onClick={loadDashboardData} className="mr-2">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
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
                <Trash2 className="mr-1 h-3 w-3" />
                Limpiar y Sincronizar
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-l-4 border-amber-500 bg-amber-50">
          <CardContent className="pt-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">{error}</p>
              <p className="text-xs text-amber-700 mt-1">
                Los datos pueden estar incompletos. Puedes intentar actualizar o continuar con los datos disponibles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {syncMessage && (
        <Card
          className={`border-l-4 ${syncMessage.includes("✅") ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
        >
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">{syncMessage}</p>
            {Object.keys(syncDetails).length > 0 && (
              <div className="text-xs space-y-1 mt-2">
                <p className="font-semibold">Detalles de sincronización:</p>

                {/* Mostrar limpieza */}
                {syncDetails.limpieza && (
                  <div className="mb-2 p-2 bg-red-50 rounded">
                    <p className="font-medium text-red-800">🧹 Datos eliminados:</p>
                    <ul className="list-disc pl-5 space-y-1 text-red-700">
                      <li>Productos: {syncDetails.limpieza.productos}</li>
                      <li>Pedidos: {syncDetails.limpieza.pedidos}</li>
                      <li>Clientes: {syncDetails.limpieza.clientes}</li>
                      <li>Colecciones: {syncDetails.limpieza.colecciones}</li>
                      <li>Promociones: {syncDetails.limpieza.promociones}</li>
                    </ul>
                  </div>
                )}

                {/* Mostrar inserciones */}
                <div className="p-2 bg-green-50 rounded">
                  <p className="font-medium text-green-800">📥 Datos insertados:</p>
                  <ul className="list-disc pl-5 space-y-1 text-green-700">
                    {Object.entries(syncDetails).map(([tipo, resultado]: [string, any]) => {
                      if (typeof resultado === "object" && resultado.insertados !== undefined && tipo !== "limpieza") {
                        return (
                          <li key={tipo}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}: {resultado.insertados} insertados
                            {resultado.errores > 0 && `, ${resultado.errores} errores`}
                          </li>
                        )
                      }
                      return null
                    })}
                  </ul>
                </div>

                {/* Mostrar configuraciones */}
                <div className="p-2 bg-blue-50 rounded">
                  <p className="font-medium text-blue-800">⚙️ Configuraciones:</p>
                  <ul className="list-disc pl-5 space-y-1 text-blue-700">
                    {Object.entries(syncDetails).map(([tipo, resultado]: [string, any]) => {
                      if (
                        typeof resultado === "boolean" ||
                        (typeof resultado === "object" && resultado.guardada !== undefined)
                      ) {
                        const guardada = typeof resultado === "boolean" ? resultado : resultado.guardada
                        return (
                          <li key={tipo}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}: {guardada ? "✅ Guardado" : "❌ Error"}
                          </li>
                        )
                      }
                      return null
                    })}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <Euro className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{dashboardData?.stats?.totalSales || "0.00"}</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promociones</CardTitle>
              <Percent className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.totalPromotions || 0}</div>
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
              {dashboardData?.salesOverview && dashboardData.salesOverview.length > 0 ? (
                <SalesOverview data={dashboardData.salesOverview} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  No hay datos de ventas disponibles
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Pedidos recientes</CardTitle>
              <CardDescription>Últimos pedidos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                <RecentOrders data={dashboardData.recentOrders} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">No hay pedidos recientes</div>
              )}
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
              {dashboardData?.recentProducts && dashboardData.recentProducts.length > 0 ? (
                <RecentProducts data={dashboardData.recentProducts} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">No hay productos recientes</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado del inventario</CardTitle>
              <CardDescription>Resumen del stock disponible</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.inventoryStatus ? (
                <InventoryStatus data={dashboardData.inventoryStatus} />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">No hay datos de inventario</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
