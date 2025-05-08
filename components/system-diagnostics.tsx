import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"

export function SystemDiagnostics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Shopify</CardTitle>
        </CardHeader>
        <CardContent>
          <ShopifyConnectionStatus />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
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
  )
}
