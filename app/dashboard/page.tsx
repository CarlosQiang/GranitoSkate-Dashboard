"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
} from "lucide-react"
import { getAnalyticsData } from "@/lib/api/analytics"
import { testShopifyConnection } from "@/lib/shopify"
import { fetchRecentProducts } from "@/lib/api/products"
import { fetchRecentOrders } from "@/lib/api/orders"
import Link from "next/link"

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [shopifyStatus, setShopifyStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Verificar conexión con Shopify
      const shopifyTest = await testShopifyConnection()
      setShopifyStatus(shopifyTest)

      if (shopifyTest.success) {
        // Cargar datos en paralelo
        const [analyticsData, products, orders] = await Promise.all([
          getAnalyticsData(),
          fetchRecentProducts(5),
          fetchRecentOrders(5),
        ])

        setAnalytics(analyticsData)
        setRecentProducts(products)
        setRecentOrders(orders)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await loadDashboardData()
    setIsRefreshing(false)
    toast({
      title: "Datos actualizados",
      description: "El dashboard se ha actualizado correctamente",
    })
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {shopifyStatus?.success ? `Bienvenido de vuelta, Administrador` : "Configura Shopify para ver los datos"}
          </p>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Estado de Shopify */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {shopifyStatus?.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            Estado de Shopify
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shopifyStatus?.success ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Conectado correctamente</p>
                <p className="text-xs text-muted-foreground">{shopifyStatus.message}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Activo
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Error de conexión</p>
                <p className="text-xs text-muted-foreground">{shopifyStatus?.message}</p>
              </div>
              <Link href="/dashboard/setup">
                <Button size="sm">Configurar</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas principales */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.revenueGrowth > 0 ? "+" : ""}
                {analytics.revenueGrowth.toFixed(1)}% respecto al mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.ordersGrowth > 0 ? "+" : ""}
                {analytics.ordersGrowth.toFixed(1)}% respecto al mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">Por pedido</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Productos recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Productos Recientes</CardTitle>
              <CardDescription>Últimos productos añadidos</CardDescription>
            </div>
            <Link href="/dashboard/products/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{product.vendor}</p>
                    </div>
                    <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                      {product.status === "ACTIVE" ? "Activo" : "Borrador"}
                    </Badge>
                  </div>
                ))}
                <Link href="/dashboard/products" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay productos</p>
                <Link href="/dashboard/products/new">
                  <Button size="sm" className="mt-2">
                    Crear producto
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pedidos recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Últimos pedidos recibidos</CardDescription>
            </div>
            <Link href="/dashboard/orders">
              <Button size="sm" variant="outline">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{order.name}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(Number.parseFloat(order.totalPrice))}</p>
                      <Badge variant="outline" className="text-xs">
                        {order.displayFinancialStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/orders" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay pedidos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas comunes del día a día</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/products/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Crear producto
              </Button>
            </Link>
            <Link href="/dashboard/collections/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Crear colección
              </Button>
            </Link>
            <Link href="/dashboard/promotions/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Crear promoción
              </Button>
            </Link>
            <Link href="/dashboard/customers/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Añadir cliente
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
