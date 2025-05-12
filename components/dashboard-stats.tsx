"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Users, Package, DollarSign, RefreshCw, AlertCircle } from "lucide-react"
import { fetchDashboardStats } from "@/lib/api/dashboard"
import { formatCurrency } from "@/lib/utils"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalSales: "0",
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    currency: "EUR",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      console.error("Error al cargar estadísticas:", err)
      setError("No se pudieron cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error al cargar estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
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
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSales, stats.currency)}</div>
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
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
              <p className="text-xs text-muted-foreground">Pedidos totales</p>
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
              <p className="text-xs text-muted-foreground">Productos activos</p>
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
              <p className="text-xs text-muted-foreground">Clientes registrados</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
