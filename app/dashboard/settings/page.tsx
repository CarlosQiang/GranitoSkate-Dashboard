import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShopifyConfigChecker } from "@/components/shopify-config-checker"
import { SystemConfigChecker } from "@/components/system-config-checker"
import { DbConnectionStatus } from "@/components/db-connection-status"
import { EnvVariablesChecker } from "@/components/env-variables-checker"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de la aplicación</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configuración general de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <EnvVariablesChecker />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shopify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Shopify</CardTitle>
              <CardDescription>Gestiona la conexión con tu tienda Shopify</CardDescription>
            </CardHeader>
            <CardContent>
              <ShopifyConfigChecker />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Base de Datos</CardTitle>
              <CardDescription>Gestiona la conexión con la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <DbConnectionStatus />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Verifica el estado de todos los componentes del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemConfigChecker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
