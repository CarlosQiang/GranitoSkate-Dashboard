import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Diagnóstico del Sistema</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>Comprueba el estado de los componentes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Servidor</span>
                </div>
                <span className="text-sm text-green-500">Operativo</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Base de datos</span>
                </div>
                <span className="text-sm text-green-500">Conectada</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>API de Shopify</span>
                </div>
                <span className="text-sm text-amber-500">Modo Demo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Autenticación</span>
                </div>
                <span className="text-sm text-green-500">Operativa</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar estado
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Información del Sistema
            </CardTitle>
            <CardDescription>Detalles técnicos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Versión</span>
                <span className="text-sm">1.0.0</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Entorno</span>
                <span className="text-sm">Producción</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Next.js</span>
                <span className="text-sm">14.0.4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última actualización</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                <p className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    El sistema está funcionando en modo de demostración. Para conectar con Shopify, configura las
                    variables de entorno.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
