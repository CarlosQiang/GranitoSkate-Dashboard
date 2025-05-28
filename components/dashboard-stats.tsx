"use client"

import { useEffect, useState } from "react"
import { fetchDashboardStats } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export function DashboardStats({ data }: { data?: any }) {
  const [stats, setStats] = useState<any>(data || null)
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!data) {
      const loadStats = async () => {
        try {
          setLoading(true)
          const statsData = await fetchDashboardStats()
          setStats(statsData)
          setError(null)
        } catch (err) {
          console.error("Error al cargar estadísticas del dashboard:", err)
          setError("Error al cargar estadísticas")
        } finally {
          setLoading(false)
        }
      }

      loadStats()
    }
  }, [data])

  const formatCurrency = (value: number, currency = "EUR") => {
    try {
      const currencyCode = currency || "EUR"
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currencyCode,
      }).format(value)
    } catch (error) {
      console.error("Error al formatear moneda:", error)
      return `${value.toFixed(2)} €`
    }
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return {
      value: Math.abs(change),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      className: isPositive ? "text-green-600" : "text-red-600",
    }
  }

  const statsConfig = [
    {
      title: "Ventas Totales",
      value: stats?.totalSales || 0,
      change: stats?.salesChange || 0,
      icon: DollarSign,
      formatter: (value: number) => formatCurrency(value, stats?.currency),
      color: "text-green-600",
    },
    {
      title: "Pedidos",
      value: stats?.totalOrders || 0,
      change: stats?.ordersChange || 0,
      icon: ShoppingCart,
      formatter: (value: number) => value.toLocaleString(),
      color: "text-blue-600",
    },
    {
      title: "Clientes",
      value: stats?.totalCustomers || 0,
      change: stats?.customersChange || 0,
      icon: Users,
      formatter: (value: number) => value.toLocaleString(),
      color: "text-purple-600",
    },
    {
      title: "Productos",
      value: stats?.totalProducts || 0,
      change: stats?.productsChange || 0,
      icon: Package,
      formatter: (value: number) => value.toLocaleString(),
      color: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-responsive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (error) {
    return (
      <div className="col-span-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      {statsConfig.map((stat, index) => {
        const changeData = formatChange(stat.change)
        const IconComponent = stat.icon
        const ChangeIcon = changeData.icon

        return (
          <Card key={index} className="card-responsive hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <IconComponent className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stat.formatter(stat.value)}</div>
                <div className="flex items-center text-xs">
                  <ChangeIcon className={cn("h-3 w-3 mr-1", changeData.className)} />
                  <span className={changeData.className}>
                    {changeData.isPositive ? "+" : ""}
                    {changeData.value}%
                  </span>
                  <span className="text-muted-foreground ml-1">desde el mes pasado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
