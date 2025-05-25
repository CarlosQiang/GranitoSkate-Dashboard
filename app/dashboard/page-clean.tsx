import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Settings, Database, CheckCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al sistema de gestión GranitoSkate</p>
      </div>

      {/* Estado del sistema */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Operativo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Base de datos conectada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Usuario admin activo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sistema de logging activo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuración</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Listo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sistema configurado</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas comunes del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <a href="/dashboard/registros" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Ver Registros</p>
                    <p className="text-sm text-muted-foreground">Revisar actividad del sistema</p>
                  </div>
                </div>
              </a>

              <a
                href="/dashboard/administradores"
                className="block p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Gestionar Administradores</p>
                    <p className="text-sm text-muted-foreground">Crear y editar usuarios admin</p>
                  </div>
                </div>
              </a>

              <a href="/dashboard/setup" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Configuración Inicial</p>
                    <p className="text-sm text-muted-foreground">Verificar configuración del sistema</p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información sobre el funcionamiento actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de datos</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Conectada
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Autenticación</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Funcionando
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Sistema de logs</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Shopify (próximamente)</span>
                <span className="flex items-center text-sm text-yellow-600">
                  <Activity className="h-4 w-4 mr-1" />
                  Pendiente
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
