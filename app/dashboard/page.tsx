"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  Activity,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Package,
  ShoppingCart,
} from "lucide-react"
import { ActivityLogger } from "@/lib/services/activity-logger"
import { fetchRecentProducts, fetchLowStockProducts } from "@/lib/api/products"
import { fetchRecentOrders } from "@/lib/api/orders"
import { testConnection } from "@/lib/db"
import { useSession } from "next-auth/react"

interface DashboardStats {
  dbStatus: "connected" | "disconnected" | "error"
  totalRegistros: number
  operacionesExitosas: number
  usuariosActivos: number
  recentProducts: any[]
  lowStockProducts: any[]
  recentOrders: any[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Verificar conexión a la base de datos
      const dbConnection = await testConnection()

      // Obtener estadísticas de actividad
      const activityStats = await ActivityLogger.getActivityStats()

      // Obtener datos de Shopify (con manejo de errores)
      let recentProducts = []
      let lowStockProducts = []
      let recentOrders = []

      try {
        recentProducts = await fetchRecentProducts(5)
      } catch (err) {
        console.warn("No se pudieron cargar productos recientes:", err)
      }

      try {
        lowStockProducts = await fetchLowStockProducts(10)
      } catch (err) {
        console.warn("No se pudieron cargar productos con stock bajo:", err)
      }

      try {
        recentOrders = await fetchRecentOrders(5)
      } catch (err) {
        console.warn("No se pudieron cargar pedidos recientes:", err)
      }

      setStats({
        dbStatus: dbConnection.success ? "connected" : "error",
        totalRegistros: activityStats.total_registros || 0,
        operacionesExitosas: activityStats.exitosos || 0,
        usuariosActivos: activityStats.usuarios_activos || 0,
        recentProducts,
        lowStockProducts,
        recentOrders,
      })

      // Registrar acceso al dashboard
      if (session?.user) {
        await ActivityLogger.log({
          usuarioId: Number.parseInt(session.user.id),
          usuarioNombre: session.user.name || "Usuario",
          accion: "DASHBOARD_ACCESS",
          entidad: "DASHBOARD",
          descripcion: "Accedió al dashboard principal",
        })
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err)
      setError("Error al cargar los datos del dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [session])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta, {session?.user?.name || "Administrador"}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
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
          <p className="text-muted-foreground">Bienvenido de vuelta, {session?.user?.name || "Administrador"}</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de la Base de Datos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.dbStatus === "connected" ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectada
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Funcionando correctamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros de Actividad</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRegistros || 0}</div>
            <p className="text-xs text-muted-foreground">Máximo 10 registros mantenidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Exitosas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.operacionesExitosas || 0}</div>
            <p className="text-xs text-muted-foreground">De {stats?.totalRegistros || 0} operaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.usuariosActivos || 0}</div>
            <p className="text-xs text-muted-foreground">En los últimos registros</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado del Sistema */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información de la base de datos y conexiones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de Datos:</span>
              {stats?.dbStatus === "connected" ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectada
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tablas:</span>
              <Badge variant="outline">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sesión:</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Usuario:</span>
              <span className="text-sm font-medium">{session?.user?.role || "Administrador"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos 10 movimientos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.totalRegistros === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hay actividad registrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total de registros:</span>
                    <Badge variant="outline">{stats?.totalRegistros}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Operaciones exitosas:</span>
                    <Badge className="bg-green-100 text-green-800">{stats?.operacionesExitosas}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Usuarios activos:</span>
                    <Badge variant="outline">{stats?.usuariosActivos}</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Shopify */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos Recientes
            </CardTitle>
            <CardDescription>Últimos productos de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentProducts.length === 0 ? (
              <div className="text-center py-4">
                <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay productos disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{product.title}</span>
                    <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                      {product.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Stock Bajo
            </CardTitle>
            <CardDescription>Productos con poco inventario</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.lowStockProducts.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Stock en buen estado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{product.title}</span>
                    <Badge variant="destructive">{product.quantity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos Recientes
            </CardTitle>
            <CardDescription>Últimos pedidos de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders.length === 0 ? (
              <div className="text-center py-4">
                <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay pedidos recientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{order.name}</span>
                    <span className="font-medium">
                      {order.totalPrice} {order.currencyCode}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
