"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Users, Package, DollarSign, RefreshCw } from "lucide-react"
import { fetchShopStats } from "@/lib/api/dashboard"
import { Button } from "@/components/ui/button"

interface StatsData {
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalRevenue: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: "€0.00",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchShopStats()
      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError((err as Error).message || "Error al cargar estadísticas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalRevenue}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p className="flex items-center gap-2">
            <span className="font-medium">Error al cargar estadísticas:</span> {error}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchStats}
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Actualizar datos
        </Button>
      </div>
    </div>
  )
}
