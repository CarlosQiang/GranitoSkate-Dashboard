"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Users, Package, DollarSign, RefreshCw } from "lucide-react"
import { fetchShopStats } from "@/lib/api/dashboard"
import { ErrorHandler } from "@/components/error-handler"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface StatsData {
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalRevenue: string
  error?: string
}

export function DashboardStats() {
  const { toast } = useToast()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchShopStats()

      if (data.error) {
        throw new Error(data.error)
      }

      setStats(data)

      // Si los datos son todos ceros, mostrar una advertencia
      if (
        data.totalOrders === 0 &&
        data.totalCustomers === 0 &&
        data.totalProducts === 0 &&
        data.totalRevenue === "€0.00"
      ) {
        toast({
          title: "Datos limitados",
          description: "No se encontraron datos de actividad en la tienda",
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar estadísticas"))
      toast({
        title: "Error al cargar estadísticas",
        description: "No se pudieron cargar las estadísticas de la tienda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorHandler error={error} resetError={handleRetry} message="Error al cargar las estadísticas" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cargando...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRevenue || "€0.00"}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
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
