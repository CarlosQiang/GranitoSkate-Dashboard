"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, ShoppingCart, Euro, Package, AlertTriangle, Search, Eye } from "lucide-react"
import Link from "next/link"
import { ResponsivePageContainer } from "@/components/responsive-page-container"

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ordersData, setOrdersData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all")

  const loadOrdersData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("📦 Loading orders data...")

      const response = await fetch("/api/orders/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Orders API error: ${response.status}`)
      }

      const result = await response.json()

      console.log("✅ Orders data loaded successfully:", result)
      setOrdersData(result.data)

      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error("❌ Error loading orders:", err)
      setError(err instanceof Error ? err.message : "Error loading orders")

      // Datos de fallback
      setOrdersData({
        stats: {
          totalOrders: 0,
          totalValue: "0.00",
          pendingOrders: 0,
          fulfilledOrders: 0,
          currency: "EUR",
        },
        orders: [],
        recentOrders: [],
        byFinancialStatus: {},
        byFulfillmentStatus: {},
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Añadir esta función después de loadOrdersData
  const testOrdersConnection = async () => {
    try {
      console.log("🧪 Testing orders connection...")
      const response = await fetch("/api/orders/test")
      const result = await response.json()

      console.log("🧪 Test result:", result)

      if (result.success) {
        alert(`✅ Conexión exitosa: ${result.message}`)
      } else {
        alert(`❌ Error en la conexión: ${result.message}`)
      }
    } catch (error) {
      console.error("❌ Error testing connection:", error)
      alert("❌ Error al probar la conexión")
    }
  }

  useEffect(() => {
    loadOrdersData()
  }, [loadOrdersData])

  // Filtrar pedidos
  const filteredOrders =
    ordersData?.orders?.filter((order: any) => {
      const matchesSearch =
        !searchTerm ||
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.financialStatus === statusFilter
      const matchesFulfillment = fulfillmentFilter === "all" || order.fulfillmentStatus === fulfillmentFilter

      return matchesSearch && matchesStatus && matchesFulfillment
    }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      case "FULFILLED":
        return "bg-blue-100 text-blue-800"
      case "UNFULFILLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <ResponsivePageContainer>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedidos</h2>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResponsivePageContainer>
    )
  }

  return (
    <ResponsivePageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-sm text-muted-foreground">Gestiona y supervisa todos los pedidos de tu tienda</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={loadOrdersData} className="w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar Pedidos
            </Button>
            <Button onClick={testOrdersConnection} variant="outline" className="w-full sm:w-auto">
              🧪 Probar Conexión
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-l-4 border-amber-500 bg-amber-50">
            <CardContent className="pt-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-amber-800 break-words">{error}</p>
                <p className="text-xs text-amber-700 mt-1">
                  Algunos datos pueden estar incompletos. Puedes intentar actualizar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersData?.stats?.totalOrders || 0}</div>
              <p className="text-xs text-gray-500">Todos los pedidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Euro className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{ordersData?.stats?.totalValue || "0.00"}</div>
              <p className="text-xs text-gray-500">Ingresos totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Package className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersData?.stats?.pendingOrders || 0}</div>
              <p className="text-xs text-gray-500">Por procesar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersData?.stats?.fulfilledOrders || 0}</div>
              <p className="text-xs text-gray-500">Entregados</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por número o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado Financiero</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PAID">Pagado</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado de Envío</label>
                <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los envíos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los envíos</SelectItem>
                    <SelectItem value="FULFILLED">Enviado</SelectItem>
                    <SelectItem value="UNFULFILLED">Sin enviar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados</label>
                <div className="text-sm text-gray-600 py-2">
                  {filteredOrders.length} de {ordersData?.orders?.length || 0} pedidos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Pedidos</CardTitle>
            <CardDescription>
              {filteredOrders.length > 0
                ? `Mostrando ${filteredOrders.length} pedidos`
                : "No se encontraron pedidos con los filtros aplicados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid gap-4">
                    {filteredOrders.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{order.name}</h3>
                              <Badge className={getStatusColor(order.financialStatus)}>{order.financialStatus}</Badge>
                              <Badge className={getStatusColor(order.fulfillmentStatus)}>
                                {order.fulfillmentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.customer?.firstName} {order.customer?.lastName} - {order.customer?.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-semibold">€{order.totalPrice}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.processedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Productos:</span>{" "}
                            {order.items
                              .slice(0, 2)
                              .map((item: any) => item.title)
                              .join(", ")}
                            {order.items.length > 2 && ` y ${order.items.length - 2} más`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
                <p className="text-gray-500">
                  {ordersData?.orders?.length === 0
                    ? "No se han encontrado pedidos en tu tienda."
                    : "No hay pedidos que coincidan con los filtros aplicados."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsivePageContainer>
  )
}
