"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesChart, TopProductsChart } from "@/components/charts"
import { fetchDashboardStats } from "@/lib/api/dashboard"
import { ShoppingBag, Users, Package, DollarSign, RefreshCw, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("30d")

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      console.error("Error al cargar estadísticas:", err)
      setError(err.message || "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analítica</h1>
          <p className="text-muted-foreground">Visualiza el rendimiento de tu tienda</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periodo de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-2xl font-bold">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <div className="flex items-center pt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0% desde el último mes</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-2xl font-bold">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <div className="flex items-center pt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0% desde el último mes</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-2xl font-bold">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <div className="flex items-center pt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Actualizado hoy</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-2xl font-bold">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
                <div className="flex items-center pt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0% desde el último mes</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={loadStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <SalesChart />
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <TopProductsChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
