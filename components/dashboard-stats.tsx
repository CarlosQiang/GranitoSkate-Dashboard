"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Users, Package, DollarSign, RefreshCw, TrendingUp } from "lucide-react"
import { fetchShopStats } from "@/lib/api/dashboard"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

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
  const [progress, setProgress] = useState(0)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    setProgress(30)
    try {
      const data = await fetchShopStats()
      setStats(data)
      setProgress(100)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError((err as Error).message || "Error al cargar estadísticas")
      setProgress(100)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-4">
      {progress > 0 && progress < 100 && <Progress value={progress} className="h-1 w-full bg-gray-200" />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-granito/20 transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 h-1 w-full bg-granito"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <div className="rounded-full bg-granito/10 p-2">
              <ShoppingCart className="h-4 w-4 text-granito" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+0%</span> desde el mes pasado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-granito/20 transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 h-1 w-full bg-granito"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <div className="rounded-full bg-granito/10 p-2">
              <Users className="h-4 w-4 text-granito" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+0%</span> desde el mes pasado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-granito/20 transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 h-1 w-full bg-granito"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <div className="rounded-full bg-granito/10 p-2">
              <Package className="h-4 w-4 text-granito" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+0%</span> desde el mes pasado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-granito/20 transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 h-1 w-full bg-granito"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <div className="rounded-full bg-granito/10 p-2">
              <DollarSign className="h-4 w-4 text-granito" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{stats.totalRevenue}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+0%</span> desde el mes pasado
                </p>
              </div>
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
        <Button onClick={fetchStats} disabled={isLoading} className="text-xs bg-granito hover:bg-granito-dark">
          <RefreshCw className="mr-1 h-3 w-3" />
          Actualizar datos
        </Button>
      </div>
    </div>
  )
}
