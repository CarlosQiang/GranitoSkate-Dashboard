"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { SalesOverview } from "@/components/sales-overview"
import { InventoryStatus } from "@/components/inventory-status"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, ShoppingBag, Tag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [recentCollections, setRecentCollections] = useState<any[]>([])
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [allCollections, setAllCollections] = useState<any[]>([])
  const [salesOverview, setSalesOverview] = useState<any[]>([])
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncDetails, setSyncDetails] = useState<any>({})

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
      setRecentCustomers(data?.recentCustomers || [])
      setRecentCollections(data?.recentCollections || [])
      setAllOrders(data?.allOrders || [])
      setAllProducts(data?.allProducts || [])
      setAllCustomers(data?.allCustomers || [])
      setAllCollections(data?.allCollections || [])
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
    setSyncMessage(null)
    setSyncDetails({})
    const details = {}

    try {
      console.log("🔄 Iniciando sincronización con base de datos...")

      // Sincronizar productos
      if (allProducts && allProducts.length > 0) {
        console.log(`📦 Sincronizando ${allProducts.length} productos...`)
        const productResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "productos",
            datos: allProducts,
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
      if (allOrders && allOrders.length > 0) {
        console.log(`🛒 Sincronizando ${allOrders.length} pedidos...`)
        const orderResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "pedidos",
            datos: allOrders,
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
      if (allCustomers && allCustomers.length > 0) {
        console.log(`👥 Sincronizando ${allCustomers.length} clientes...`)
        const customerResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "clientes",
            datos: allCustomers,
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
      if (allCollections && allCollections.length > 0) {
        console.log(`📚 Sincronizando ${allCollections.length} colecciones...`)
        const collectionResponse = await fetch("/api/db/sincronizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "colecciones",
            datos: allCollections,
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
        <DashboardStats data={dashboardData?.stats} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Productos ({allProducts.length})
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="h-4 w-4 mr-2" />
              Clientes ({allCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="collections">
              <Tag className="h-4 w-4 mr-2" />
              Colecciones ({allCollections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Todos los productos ({allProducts.length})</CardTitle>
                <CardDescription>Productos disponibles para sincronizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Título
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tipo
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Precio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allProducts.slice(0, 10).map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.productType || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.status}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.variants && product.variants[0]
                              ? `€${Number.parseFloat(product.variants[0].price).toFixed(2)}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                      {allProducts.length > 10 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                            Mostrando 10 de {allProducts.length} productos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Todos los clientes ({allCustomers.length})</CardTitle>
                <CardDescription>Clientes disponibles para sincronizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nombre
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Teléfono
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Pedidos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allCustomers.slice(0, 10).map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone || "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.orders ? customer.orders.length : 0}
                          </td>
                        </tr>
                      ))}
                      {allCustomers.length > 10 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                            Mostrando 10 de {allCustomers.length} clientes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections">
            <Card>
              <CardHeader>
                <CardTitle>Todas las colecciones ({allCollections.length})</CardTitle>
                <CardDescription>Colecciones disponibles para sincronizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Título
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Handle
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Imagen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allCollections.slice(0, 10).map((collection) => (
                        <tr key={collection.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {collection.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {collection.handle || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {collection.image ? (
                              <img
                                src={collection.image.url || "/placeholder.svg"}
                                alt={collection.title}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                      {allCollections.length > 10 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                            Mostrando 10 de {allCollections.length} colecciones
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
