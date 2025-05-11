import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemDiagnostics } from "@/components/system-diagnostics"
import { ShopifyDiagnostics } from "@/components/shopify-diagnostics"
import APIDiagnostics from "@/components/api-diagnostics"

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnósticos</h1>
        <p className="text-muted-foreground">Verifica el estado del sistema y la conexión con Shopify</p>
      </div>

      <Tabs defaultValue="system">
        <TabsList>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="space-y-4">
          <SystemDiagnostics />
        </TabsContent>
        <TabsContent value="shopify" className="space-y-4">
          <ShopifyDiagnostics />
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <APIDiagnostics />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Información del sistema</CardTitle>
          <CardDescription>Detalles técnicos sobre la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Versión de Next.js</div>
              <div>15.x</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Versión de React</div>
              <div>18.x</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Entorno</div>
              <div>Producción</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">API de Shopify</div>
              <div>2023-07</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
