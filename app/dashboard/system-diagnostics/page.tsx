import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function SystemDiagnosticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnósticos del Sistema</h1>
          <p className="text-muted-foreground">Verifica el estado de los componentes del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Shopify</CardTitle>
            <CardDescription>Conexión con la API de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Conectado</AlertTitle>
              <AlertDescription className="text-green-700">
                La conexión con Shopify está funcionando correctamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
            <CardDescription>Sistema de autenticación</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Funcionando</AlertTitle>
              <AlertDescription className="text-green-700">
                El sistema de autenticación está funcionando correctamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variables de Entorno</CardTitle>
            <CardDescription>Configuración del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Configuradas</AlertTitle>
              <AlertDescription className="text-green-700">
                Las variables de entorno están configuradas correctamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Versión del Sistema</CardTitle>
            <CardDescription>Información de la versión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Versión:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Entorno:</span> Producción
              </div>
              <div>
                <span className="font-medium">Última actualización:</span> {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Información de diagnóstico</h2>
        <p className="text-yellow-700">
          Esta página muestra información simulada para fines de demostración. Los diagnósticos reales estarán
          disponibles en futuras actualizaciones.
        </p>
      </div>
    </div>
  )
}
