"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Download, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { SystemDiagnostics } from "@/components/system-diagnostics"
import { EnvVariablesChecker } from "@/components/env-variables-checker"
import { TestShopifyConnection } from "@/components/test-shopify-connection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function DiagnosticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [error, setError] = useState(null)
  const [diagnosticLog, setDiagnosticLog] = useState("")

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

      // Generar un log de diagnóstico
      const log = generateDiagnosticLog(data)
      setDiagnosticLog(log)
    } catch (err) {
      console.error("Error al ejecutar el diagnóstico:", err)
      setError(err.message || "Error desconocido al ejecutar el diagnóstico")
    } finally {
      setIsLoading(false)
    }
  }

  const generateDiagnosticLog = (data) => {
    if (!data) return ""

    const timestamp = new Date().toISOString()
    let log = `# Diagnóstico del sistema - ${timestamp}\n\n`

    // Resumen
    log += `## Resumen\n\n`
    log += `Estado: ${data.summary.status === "ok" ? "✅ OK" : "❌ Error"}\n`
    log += `Mensaje: ${data.summary.message}\n`

    if (data.summary.details && data.summary.details.length > 0) {
      log += `Detalles:\n`
      data.summary.details.forEach((detail) => {
        log += `- ${detail}\n`
      })
    }

    log += `\n## Variables de entorno\n\n`
    log += `Estado: ${data.env.allRequired ? "✅ OK" : "❌ Error"}\n\n`

    if (data.env.variables) {
      log += `| Variable | Estado | Requerida |\n`
      log += `|----------|--------|----------|\n`

      Object.entries(data.env.variables).forEach(([name, info]) => {
        const status = info.exists ? "✅ Configurada" : "❌ No configurada"
        const required = info.required ? "Sí" : "No"
        log += `| ${name} | ${status} | ${required} |\n`
      })
    }

    log += `\n## Conexión a Shopify\n\n`
    log += `Estado: ${data.shopify.success ? "✅ OK" : "❌ Error"}\n`
    log += `Mensaje: ${data.shopify.message}\n`

    if (data.shopify.success && data.shopify.data && data.shopify.data.shop) {
      log += `\nInformación de la tienda:\n`
      log += `- Nombre: ${data.shopify.data.shop.name}\n`
      if (data.shopify.data.shop.id) log += `- ID: ${data.shopify.data.shop.id}\n`
      if (data.shopify.data.shop.url) log += `- URL: ${data.shopify.data.shop.url}\n`
    }

    if (!data.shopify.success && data.shopify.details) {
      log += `\nDetalles del error:\n`
      if (Array.isArray(data.shopify.details)) {
        data.shopify.details.forEach((detail) => {
          log += `- ${detail}\n`
        })
      } else if (typeof data.shopify.details === "string") {
        log += `- ${data.shopify.details}\n`
      }
    }

    log += `\n## Conexión a la base de datos\n\n`
    log += `Estado: ${data.database.success ? "✅ OK" : "❌ Error"}\n`
    log += `Mensaje: ${data.database.message}\n`

    if (!data.database.success && data.database.details) {
      log += `\nDetalles del error: ${data.database.details}\n`
    }

    return log
  }

  const downloadDiagnosticLog = () => {
    if (!diagnosticLog) return

    const blob = new Blob([diagnosticLog], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `diagnostico-sistema-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
        <div className="flex gap-2">
          <Button onClick={runFullDiagnostic} disabled={isLoading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Ejecutando..." : "Ejecutar diagnóstico"}
          </Button>
          <Button onClick={downloadDiagnosticLog} disabled={!diagnosticLog} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar informe
          </Button>
        </div>
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
          <AlertDescription>
            {diagnosticResults.summary.message}
            {diagnosticResults.summary.details && diagnosticResults.summary.details.length > 0 && (
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {diagnosticResults.summary.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="diagnostics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics">Diagnóstico completo</TabsTrigger>
          <TabsTrigger value="components">Componentes individuales</TabsTrigger>
          <TabsTrigger value="help">Ayuda y soluciones</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="mt-6">
          <SystemDiagnostics />
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <EnvVariablesChecker />
            <TestShopifyConnection />

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Shopify</CardTitle>
                <CardDescription>Actualiza las credenciales de Shopify</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configura o actualiza las credenciales de acceso a la API de Shopify para conectar con tu tienda.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/settings/shopify">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ir a configuración
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico de Base de Datos</CardTitle>
                <CardDescription>Verifica la conexión con la base de datos y el estado de las tablas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta herramienta verifica la estructura de la base de datos, las tablas y las relaciones.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/diagnostics/db-check">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Verificar Base de Datos
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="help" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solución de problemas comunes</CardTitle>
                <CardDescription>Guía para resolver los problemas más frecuentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Problemas de conexión con Shopify</h3>
                  <div className="space-y-2 pl-4">
                    <h4 className="font-medium">Error: "Faltan credenciales de Shopify"</h4>
                    <p className="text-sm text-muted-foreground">
                      Este error indica que no se han configurado correctamente las variables de entorno necesarias para
                      conectar con Shopify.
                    </p>
                    <div className="pl-4 space-y-2 mt-2">
                      <p className="text-sm font-medium">Solución:</p>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        <li>
                          Verifica que las variables <code>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</code> y{" "}
                          <code>SHOPIFY_ACCESS_TOKEN</code> estén configuradas en las variables de entorno.
                        </li>
                        <li>
                          Ve a la página de{" "}
                          <Link href="/dashboard/settings/shopify" className="text-blue-600 hover:underline">
                            configuración de Shopify
                          </Link>{" "}
                          y actualiza las credenciales.
                        </li>
                        <li>Asegúrate de que el dominio de la tienda tenga el formato correcto (sin https://).</li>
                        <li>Verifica que el token de acceso sea válido y tenga los permisos necesarios.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-2 pl-4">
                    <h4 className="font-medium">
                      Error: "Error de autenticación: Token de acceso inválido o expirado"
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Este error indica que el token de acceso proporcionado no es válido o ha expirado.
                    </p>
                    <div className="pl-4 space-y-2 mt-2">
                      <p className="text-sm font-medium">Solución:</p>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        <li>
                          Genera un nuevo token de acceso en el panel de Shopify: Aplicaciones &gt; Desarrollar
                          aplicaciones &gt; Crear una aplicación.
                        </li>
                        <li>
                          Asegúrate de que la aplicación tenga los permisos necesarios para acceder a los recursos que
                          necesitas (productos, colecciones, pedidos, etc.).
                        </li>
                        <li>
                          Actualiza el token de acceso en la página de{" "}
                          <Link href="/dashboard/settings/shopify" className="text-blue-600 hover:underline">
                            configuración de Shopify
                          </Link>
                          .
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-2 pl-4">
                    <h4 className="font-medium">
                      Error: "Error: Tienda no encontrada. Verifique el dominio de la tienda"
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Este error indica que el dominio de la tienda proporcionado no es válido o no existe.
                    </p>
                    <div className="pl-4 space-y-2 mt-2">
                      <p className="text-sm font-medium">Solución:</p>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        <li>
                          Verifica que el dominio de la tienda sea correcto y tenga el formato adecuado (ejemplo:
                          mi-tienda.myshopify.com).
                        </li>
                        <li>No incluyas "https://" ni "http://" en el dominio.</li>
                        <li>Asegúrate de que la tienda esté activa y accesible.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Problemas con la base de datos</h3>
                  <div className="space-y-2 pl-4">
                    <h4 className="font-medium">Error: "Error al conectar con la base de datos"</h4>
                    <p className="text-sm text-muted-foreground">
                      Este error indica que no se puede establecer una conexión con la base de datos.
                    </p>
                    <div className="pl-4 space-y-2 mt-2">
                      <p className="text-sm font-medium">Solución:</p>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        <li>
                          Verifica que la variable <code>POSTGRES_URL</code> o <code>DATABASE_URL</code> esté
                          configurada correctamente en las variables de entorno.
                        </li>
                        <li>Asegúrate de que la base de datos esté activa y accesible.</li>
                        <li>Verifica que las credenciales de acceso a la base de datos sean correctas.</li>
                        <li>
                          Si estás utilizando Vercel, verifica que la integración con la base de datos esté configurada
                          correctamente.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Problemas con la sincronización</h3>
                  <div className="space-y-2 pl-4">
                    <h4 className="font-medium">Error: "Error al sincronizar productos/colecciones"</h4>
                    <p className="text-sm text-muted-foreground">
                      Este error indica que no se pudieron sincronizar los productos o colecciones desde Shopify.
                    </p>
                    <div className="pl-4 space-y-2 mt-2">
                      <p className="text-sm font-medium">Solución:</p>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        <li>Verifica que la conexión con Shopify esté funcionando correctamente.</li>
                        <li>
                          Asegúrate de que el token de acceso tenga los permisos necesarios para acceder a los productos
                          o colecciones.
                        </li>
                        <li>Verifica que la conexión con la base de datos esté funcionando correctamente.</li>
                        <li>Revisa los logs del servidor para obtener más información sobre el error específico.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos adicionales</CardTitle>
                <CardDescription>Enlaces útiles para solucionar problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://shopify.dev/docs/api/admin-rest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentación de la API REST de Shopify
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://shopify.dev/docs/api/admin-graphql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentación de la API GraphQL de Shopify
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://shopify.dev/docs/apps/auth/admin-app-access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Cómo generar tokens de acceso para la API de Shopify
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://vercel.com/docs/storage/vercel-postgres"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentación de Vercel Postgres
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
