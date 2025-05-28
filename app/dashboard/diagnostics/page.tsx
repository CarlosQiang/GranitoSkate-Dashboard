import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SystemStatus from "@/components/system-status"
import ShopifyConnectionStatus from "@/components/shopify-connection-status"
import DbConnectionStatus from "@/components/db-connection-status"
import InitDbButton from "@/components/init-db-button"
import SystemHealthCheck from "@/components/system-health-check"

export default async function DiagnosticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Diagnósticos del Sistema</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Verificación de componentes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conexión con Shopify</CardTitle>
            <CardDescription>Estado de la conexión con la API de Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <ShopifyConnectionStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conexión con Base de Datos</CardTitle>
            <CardDescription>Estado de la conexión con la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <DbConnectionStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inicialización de Base de Datos</CardTitle>
            <CardDescription>Crear tablas y datos iniciales necesarios</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Este proceso creará la tabla de administradores y un usuario administrador por defecto si no existen.
            </p>
            <div>
              <p className="text-sm font-medium mb-1">Credenciales por defecto:</p>
              <p className="text-sm">Email: admin@granitoskate.com</p>
              <p className="text-sm">Contraseña: GranitoSkate</p>
            </div>
            <div className="mt-2">
              <InitDbButton />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <SystemHealthCheck />
        </div>
      </div>
    </div>
  )
}
