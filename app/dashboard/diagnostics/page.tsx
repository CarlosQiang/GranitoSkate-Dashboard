"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { SystemDiagnostics } from "@/components/system-diagnostics"
import { DbConnectionStatus } from "@/components/db-connection-status"
import { DbInitializer } from "@/components/db-initializer"

export default function DiagnosticsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico del sistema</h1>
        </div>
      </div>

      <p className="text-muted-foreground">
        Esta página ejecuta pruebas de diagnóstico para verificar que todos los componentes de la aplicación estén
        funcionando correctamente.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <DbConnectionStatus />
        <DbInitializer />
        <div className="md:col-span-2">
          <SystemDiagnostics />
        </div>
      </div>

      <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800">Instrucciones para solucionar problemas</h2>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Si hay errores de conexión con Shopify:</h3>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Verifica que las credenciales de Shopify sean correctas en las variables de entorno</li>
            <li>Asegúrate de que la tienda esté activa y accesible</li>
            <li>Comprueba que la API de Shopify esté funcionando correctamente</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Si hay errores de conexión con la base de datos:</h3>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Verifica que las credenciales de la base de datos sean correctas</li>
            <li>Comprueba que la base de datos esté activa y accesible</li>
            <li>Usa el botón "Inicializar Base de Datos" para crear las tablas necesarias</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Si hay errores al cargar productos o colecciones:</h3>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Verifica que existan productos o colecciones en tu tienda</li>
            <li>Comprueba los permisos de la aplicación en Shopify</li>
            <li>Revisa los logs del servidor para más detalles sobre el error</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
