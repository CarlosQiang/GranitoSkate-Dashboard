"use client"

import { useEffect, useState } from "react"
import { ShoppingBag, Users, Package, DollarSign, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchDashboardStats } from "@/lib/api/dashboard"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
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

  return (
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
              <p className="text-xs text-muted-foreground">+0% desde el último mes</p>
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
              <p className="text-xs text-muted-foreground">+0% desde el último mes</p>
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
              <p className="text-xs text-muted-foreground">+0% desde el último mes</p>
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
              <p className="text-xs text-muted-foreground">+0% desde el último mes</p>
            </>
          )}
        </CardContent>
      </Card>
      {error && (
        <div className="col-span-full">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={loadStats}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
