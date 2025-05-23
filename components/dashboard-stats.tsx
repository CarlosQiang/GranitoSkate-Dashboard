"use client"

import { useEffect, useState } from "react"
import { fetchDashboardStats } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardStats()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar estadísticas del dashboard:", err)
        setError("Error al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatCurrency = (value: number, currency = "EUR") => {
    try {
      // Asegurarse de que siempre haya un código de moneda válido
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

  return (
    <>
      {loading ? (
        <>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[120px]" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[100px]" />
                <Skeleton className="h-4 w-[80px] mt-1" />
              </CardContent>
            </Card>
          ))}
        </>
      ) : error ? (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : stats ? (
        <>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSales || 0, stats.currency)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.salesChange >= 0 ? "+" : ""}
                {stats.salesChange || 0}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ordersChange >= 0 ? "+" : ""}
                {stats.ordersChange || 0}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.customersChange >= 0 ? "+" : ""}
                {stats.customersChange || 0}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.productsChange >= 0 ? "+" : ""}
                {stats.productsChange || 0}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
  )
}
