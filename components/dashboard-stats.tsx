"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { fetchDashboardStats } from "@/lib/api/dashboard"
import { formatCurrency } from "@/lib/utils"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalSales: "0",
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    currency: "EUR",
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats()
        setStats({
          ...data,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Error al cargar estadísticas",
        }))
      }
    }

    loadStats()
  }, [])

  if (stats.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="mt-1 h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (stats.error) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-destructive">Error al cargar estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{stats.error}</p>
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
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSales, stats.currency)}</div>
          <p className="text-xs text-muted-foreground">Ingresos totales</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">Pedidos totales</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">Productos activos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">Clientes registrados</p>
        </CardContent>
      </Card>
    </div>
  )
}
