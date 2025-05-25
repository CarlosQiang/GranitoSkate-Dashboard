import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Database, CheckCircle, AlertTriangle, Package, ShoppingCart, TrendingUp } from "lucide-react"
import RegistrosRecientes from "@/components/registros-recientes"

// Función para obtener estadísticas del sistema (solo en servidor)
async function getSystemStats() {
  try {
    // Importar dinámicamente para evitar problemas en el cliente
    const { testConnection } = await import("@/lib/db")
    const { ActivityLogger } = await import("@/lib/services/activity-logger")

    const dbConnection = await testConnection()
    const estadisticas = await ActivityLogger.getActivityStats()
    const conteoRegistros = await ActivityLogger.getConteoRegistros()

    return {
      dbStatus: dbConnection.success ? "connected" : "error",
      totalRegistros: conteoRegistros || 0,
      operacionesExitosas: estadisticas?.exitosos || 0,
      usuariosActivos: estadisticas?.usuarios_activos || 0,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas del sistema:", error)
    return {
      dbStatus: "error",
      totalRegistros: 0,
      operacionesExitosas: 0,
      usuariosActivos: 0,
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getSystemStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta, {session?.user?.name || "Administrador"}</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de la Base de Datos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.dbStatus === "connected" ? (
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
            <p className="text-xs text-muted-foreground">
              {stats.dbStatus === "connected" ? "Funcionando correctamente" : "Revisar conexión"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros de Actividad</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistros}</div>
            <p className="text-xs text-muted-foreground">Máximo 10 registros mantenidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Exitosas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.operacionesExitosas}</div>
            <p className="text-xs text-muted-foreground">De {stats.totalRegistros} operaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usuariosActivos}</div>
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
              {stats.dbStatus === "connected" ? (
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
              <span className="text-sm font-medium">{session?.user?.name || "Administrador"}</span>
            </div>
          </CardContent>
        </Card>

        <RegistrosRecientes />
      </div>

      {/* Información de Shopify */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos
            </CardTitle>
            <CardDescription>Gestión de productos de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Conecta con Shopify para ver productos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </CardTitle>
            <CardDescription>Gestión de pedidos de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Conecta con Shopify para ver pedidos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>Gestión de clientes de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Conecta con Shopify para ver clientes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
