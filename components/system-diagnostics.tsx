"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SystemDiagnostics() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setStatus("loading")

    try {
      const response = await fetch("/api/system/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      setDiagnosticResults(data)

      if (data.success) {
        setStatus("success")
      } else {
        // Determinar si es un error o una advertencia
        const hasShopifyConnection = data.shopifyConnection?.success
        const hasDbConnection = data.dbConnection?.connected

        if (hasShopifyConnection || hasDbConnection) {
          setStatus("warning") // Al menos uno funciona
        } else {
          setStatus("error") // Nada funciona
        }
      }
    } catch (error) {
      console.error("Error al ejecutar diagnóstico del sistema:", error)
      setStatus("error")
      setDiagnosticResults({
        error: error instanceof Error ? error.message : "Error desconocido al ejecutar diagnóstico",
      })
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          Diagnóstico del Sistema
        </CardTitle>
        <CardDescription>Verifica el estado general del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Ejecutando diagnóstico del sistema...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {status === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Error en el sistema</AlertTitle>
                <AlertDescription>
                  Se encontraron problemas críticos en el sistema. Revisa los detalles a continuación.
                </AlertDescription>
              </Alert>
            )}

            {status === "warning" && (
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Advertencias en el sistema</AlertTitle>
                <AlertDescription>
                  El sistema está funcionando parcialmente. Revisa los detalles a continuación.
                </AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Sistema funcionando correctamente</AlertTitle>
                <AlertDescription>Todos los componentes del sistema están funcionando correctamente.</AlertDescription>
              </Alert>
            )}

            {diagnosticResults && (
              <div className="space-y-4 mt-4">
                {/* Conexión con Shopify */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    {diagnosticResults.shopifyConnection?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    Conexión con Shopify
                  </h3>
                  <div className="rounded-md border p-3">
                    <p className="text-sm">
                      {diagnosticResults.shopifyConnection?.success
                        ? diagnosticResults.shopifyConnection?.message || "Conexión exitosa"
                        : diagnosticResults.shopifyConnection?.message || "Error de conexión"}
                    </p>
                  </div>
                </div>

                {/* Conexión con la base de datos */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    {diagnosticResults.dbConnection?.connected ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    Conexión con la base de datos
                  </h3>
                  <div className="rounded-md border p-3">
                    <p className="text-sm">
                      {diagnosticResults.dbConnection?.connected
                        ? "Conexión exitosa con la base de datos"
                        : diagnosticResults.dbConnection?.error || "Error de conexión con la base de datos"}
                    </p>
                  </div>
                </div>

                {/* Configuración del sistema */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Configuración del sistema</h3>
                  <div className="rounded-md border p-3">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-xs font-medium">Shopify:</h4>
                        <ul className="text-xs space-y-1 mt-1">
                          <li>
                            API URL:{" "}
                            <span
                              className={
                                diagnosticResults.config?.shopify?.apiUrl === "Configurado"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diagnosticResults.config?.shopify?.apiUrl || "No configurado"}
                            </span>
                          </li>
                          <li>
                            Access Token:{" "}
                            <span
                              className={
                                diagnosticResults.config?.shopify?.accessToken === "Configurado"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diagnosticResults.config?.shopify?.accessToken || "No configurado"}
                            </span>
                          </li>
                          <li>
                            Shop Domain:{" "}
                            <span
                              className={
                                diagnosticResults.config?.shopify?.shopDomain === "Configurado"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diagnosticResults.config?.shopify?.shopDomain || "No configurado"}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium">Base de datos:</h4>
                        <ul className="text-xs space-y-1 mt-1">
                          <li>
                            URL:{" "}
                            <span
                              className={
                                diagnosticResults.config?.database?.url === "Configurado"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diagnosticResults.config?.database?.url || "No configurado"}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium">Autenticación:</h4>
                        <ul className="text-xs space-y-1 mt-1">
                          <li>
                            Secret:{" "}
                            <span
                              className={
                                diagnosticResults.config?.auth?.secret === "Configurado"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diagnosticResults.config?.auth?.secret || "No configurado"}
                            </span>
                          </li>
                          <li>
                            URL:{" "}
                            <span
                              className={
                                diagnosticResults.config?.auth?.url === "Configurado"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diagnosticResults.config?.auth?.url || "No configurado"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runDiagnostics} disabled={isRunning} variant="outline" className="w-full">
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Ejecutar diagnóstico
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SystemDiagnostics
