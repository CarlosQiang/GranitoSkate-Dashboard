"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { SystemDiagnostics } from "@/components/system-diagnostics"
import { DbConnectionStatus } from "@/components/db-connection-status"
import { DbInitializer } from "@/components/db-initializer"
import { TestShopifyConnection } from "@/components/test-shopify-connection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { EnvVariablesChecker } from "@/components/env-variables-checker"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function DiagnosticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [error, setError] = useState(null)

  const runFullDiagnostic = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/system/full-diagnostic", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al ejecutar el diagnóstico completo")
      }

      setDiagnosticResults(data)
    } catch (err) {
      console.error("Error al ejecutar el diagnóstico:", err)
      setError(err.message || "Error desconocido al ejecutar el diagnóstico")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Ejecutar diagnóstico automáticamente al cargar la página
    runFullDiagnostic()
  }, [])

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
        <Button onClick={runFullDiagnostic} disabled={isLoading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Ejecutando..." : "Ejecutar diagnóstico completo"}
        </Button>
      </div>

      <p className="text-muted-foreground">
        Esta página ejecuta pruebas de diagnóstico para verificar que todos los componentes de la aplicación estén
        funcionando correctamente.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {diagnosticResults && diagnosticResults.summary && (
        <Alert
          variant={diagnosticResults.summary.status === "ok" ? "default" : "destructive"}
          className={diagnosticResults.summary.status === "ok" ? "bg-green-50 border-green-200" : ""}
        >
          {diagnosticResults.summary.status === "ok" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {diagnosticResults.summary.status === "ok"
              ? "Sistema funcionando correctamente"
              : "Se encontraron problemas en el sistema"}
          </AlertTitle>
          <AlertDescription>{diagnosticResults.summary.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verificador de Variables de Entorno */}
        <EnvVariablesChecker />

        {/* Estado de Conexión a Shopify */}
        <ShopifyConnectionStatus />

        {/* Estado de Conexión a la Base de Datos */}
        <DbConnectionStatus />

        {/* Inicializador de Base de Datos */}
        <DbInitializer />

        {/* Prueba de Conexión a Shopify */}
        <TestShopifyConnection />

        {/* Diagnóstico de Base de Datos */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico de Base de Datos</CardTitle>
            <CardDescription>Verifica la conexión con la base de datos y el estado de las tablas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Esta herramienta verifica la estructura de la base de datos, las tablas y las relaciones.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/diagnostics/db-check">Verificar Base de Datos</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="md:col-span-2">
        <SystemDiagnostics />
      </div>

      <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800">Instrucciones para solucionar problemas</h2>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Si hay errores de conexión con Shopify:</h3>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Verifica que las credenciales de Shopify sean correctas en las variables de entorno</li>
            <li>Asegúrate de que la tienda esté activa y accesible</li>
            <li>Comprueba que la API de Shopify esté funcionando correctamente</li>
            <li>Recuerda que todas las solicitudes a Shopify deben pasar por el proxy del servidor</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Variables de entorno necesarias para Shopify:</h3>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>
              <strong>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</strong>: El dominio de tu tienda Shopify (ej:
              mi-tienda.myshopify.com)
            </li>
            <li>
              <strong>SHOPIFY_ACCESS_TOKEN</strong>: Token de acceso a la API de Shopify
            </li>
            <li>
              <strong>SHOPIFY_API_URL</strong>: URL de la API de Shopify (ej:
              https://mi-tienda.myshopify.com/admin/api/2023-07/graphql.json)
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Variables de entorno necesarias para la base de datos:</h3>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>
              <strong>POSTGRES_URL</strong> o <strong>DATABASE_URL</strong>: URL de conexión a la base de datos
              PostgreSQL
            </li>
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
