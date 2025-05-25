import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Database, Shield } from "lucide-react"
import RegistrosRecientes from "@/components/registros-recientes"
import { testConnection, getDatabaseInfo } from "@/lib/db"
import { ActivityLogger } from "@/lib/services/activity-logger"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Obtener información del sistema
  const dbConnection = await testConnection()
  const dbInfo = await getDatabaseInfo()
  const estadisticas = await ActivityLogger.getEstadisticas()
  const conteoRegistros = await ActivityLogger.getConteoRegistros()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta, {session?.user?.name}</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de la Base de Datos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbConnection.success ? "Conectada" : "Error"}</div>
            <p className="text-xs text-muted-foreground">
              {dbConnection.success ? "Funcionando correctamente" : "Revisar conexión"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros de Actividad</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conteoRegistros}</div>
            <p className="text-xs text-muted-foreground">Máximo 10 registros mantenidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Exitosas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.exitosos || 0}</div>
            <p className="text-xs text-muted-foreground">De {estadisticas?.total_registros || 0} operaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.usuarios_activos || 0}</div>
            <p className="text-xs text-muted-foreground">En los últimos registros</p>
          </CardContent>
        </Card>
      </div>

      {/* Información del sistema */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información de la base de datos y conexiones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Base de Datos:</span>
              <span className={`text-sm ${dbConnection.success ? "text-green-600" : "text-red-600"}`}>
                {dbConnection.success ? "✓ Conectada" : "✗ Error"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tablas:</span>
              <span className="text-sm">{dbInfo.success ? dbInfo.tables?.length || 0 : "Error"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Sesión:</span>
              <span className="text-sm text-green-600">✓ Activa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Usuario:</span>
              <span className="text-sm">{session?.user?.name}</span>
            </div>
          </CardContent>
        </Card>

        <RegistrosRecientes />
      </div>
    </div>
  )
}
