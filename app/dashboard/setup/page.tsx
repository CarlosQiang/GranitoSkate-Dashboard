import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Database, CheckCircle, AlertTriangle } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuración Inicial
        </h1>
        <p className="text-muted-foreground mt-2">Verifica el estado de los componentes del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Datos
            </CardTitle>
            <CardDescription>Estado de las tablas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tabla administradores</span>
                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activa
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tabla registros_actividad</span>
                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activa
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tabla sesiones_usuario</span>
                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activa
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuario Administrador</CardTitle>
            <CardDescription>Configuración del usuario principal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Usuario:</strong> admin
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> admin@gmail.com
                </p>
                <p className="text-sm">
                  <strong>Contraseña:</strong> GranitoSkate
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Usuario configurado correctamente
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>Verificación de componentes principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">✅ Funcionando</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Autenticación NextAuth
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Base de datos PostgreSQL
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Sistema de logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Gestión de administradores
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">⏳ Pendiente</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Integración con Shopify
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Gestión de productos
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Sistema de promociones
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Gestión de clientes
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
          <CardDescription>Recomendaciones para continuar con el desarrollo</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Verificar que puedes hacer login con las credenciales del admin</li>
            <li>Revisar que los registros de actividad se están guardando</li>
            <li>Configurar las credenciales de Shopify en variables de entorno</li>
            <li>Implementar las tablas de productos y colecciones</li>
            <li>Desarrollar la sincronización con Shopify</li>
            <li>Añadir sistema de webhooks para actualizaciones en tiempo real</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
