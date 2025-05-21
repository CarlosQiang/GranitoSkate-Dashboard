import type { Metadata } from "next"
import EnvVariablesChecker from "@/components/env-variables-checker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Configuración | GestionGranito",
  description: "Configuración del sistema GestionGranito",
}

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
      </div>

      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Para que la aplicación funcione correctamente, es necesario configurar todas las variables de entorno
          requeridas. Puedes hacerlo en la configuración de tu proyecto en Vercel.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <EnvVariablesChecker />

        <Card>
          <CardHeader>
            <CardTitle>Guía de Configuración</CardTitle>
            <CardDescription>Cómo configurar las variables de entorno en Vercel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Inicia sesión en tu cuenta de Vercel</li>
              <li>Selecciona el proyecto "GranitoSkate-Dashboard"</li>
              <li>Ve a la pestaña "Settings"</li>
              <li>En el menú lateral, selecciona "Environment Variables"</li>
              <li>
                Añade las siguientes variables:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    <strong>SHOPIFY_STORE_DOMAIN</strong>: El dominio de tu tienda Shopify (sin https://)
                  </li>
                  <li>
                    <strong>SHOPIFY_ACCESS_TOKEN</strong>: Tu token de acceso de Shopify
                  </li>
                  <li>
                    <strong>SHOPIFY_API_URL</strong>: URL de la API de Shopify
                    (https://tu-tienda.myshopify.com/admin/api/2023-07/graphql.json)
                  </li>
                  <li>
                    <strong>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</strong>: El dominio de tu tienda Shopify (sin https://)
                  </li>
                  <li>
                    <strong>POSTGRES_URL</strong>: URL de conexión a tu base de datos PostgreSQL
                  </li>
                  <li>
                    <strong>NEXTAUTH_URL</strong>: URL de tu aplicación (https://tu-app.vercel.app)
                  </li>
                  <li>
                    <strong>NEXTAUTH_SECRET</strong>: Una cadena aleatoria para cifrar las sesiones
                  </li>
                </ul>
              </li>
              <li>Haz clic en "Save" para guardar los cambios</li>
              <li>Redespliega tu aplicación para aplicar los cambios</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
