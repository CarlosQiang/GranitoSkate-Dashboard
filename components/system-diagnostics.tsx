"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SystemDiagnostics() {
  const [diagnosticData, setDiagnosticData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const runDiagnostics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/system/full-diagnostic", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al ejecutar el diagnóstico")
      }

      const data = await response.json()
      setDiagnosticData(data)
    } catch (err) {
      console.error("Error al ejecutar el diagnóstico:", err)
      setError(err.message || "Error desconocido al ejecutar el diagnóstico")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status) => {
    if (status === "ok" || status === true) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (status === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (status) => {
    if (status === "ok" || status === true) return "bg-green-50 border-green-200 text-green-800"
    if (status === "warning") return "bg-yellow-50 border-yellow-200 text-yellow-800"
    return "bg-red-50 border-red-200 text-red-800"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Ejecutando diagnóstico del sistema
          </CardTitle>
          <CardDescription>Verificando el estado de todos los componentes...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Analizando el sistema</p>
            <p className="text-sm text-muted-foreground">Esto puede tardar unos segundos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Error en el diagnóstico
          </CardTitle>
          <CardDescription>No se pudo completar el diagnóstico del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={runDiagnostics} className="mt-4 w-full">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!diagnosticData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico del sistema</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} className="w-full">
            Ejecutar diagnóstico
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(diagnosticData.summary.status)}
          Diagnóstico del sistema
        </CardTitle>
        <CardDescription>{diagnosticData.summary.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className={getStatusColor(diagnosticData.summary.status)}>
          <AlertTitle>Resumen del diagnóstico</AlertTitle>
          <AlertDescription>
            {diagnosticData.summary.message}
            {diagnosticData.summary.details && diagnosticData.summary.details.length > 0 && (
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {diagnosticData.summary.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="env" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="env">Variables de entorno</TabsTrigger>
            <TabsTrigger value="shopify">Conexión a Shopify</TabsTrigger>
            <TabsTrigger value="database">Base de datos</TabsTrigger>
          </TabsList>

          <TabsContent value="env" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-lg font-medium mb-2">Variables de entorno</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {diagnosticData.env.allRequired
                  ? "Todas las variables de entorno requeridas están configuradas"
                  : "Faltan algunas variables de entorno requeridas"}
              </p>

              <div className="space-y-3 mt-4">
                {Object.entries(diagnosticData.env.variables).map(([name, info]) => (
                  <div key={name} className="flex items-start justify-between p-2 border rounded-md">
                    <div>
                      <div className="flex items-center gap-2">
                        {info.exists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-mono text-xs">{name}</span>
                        {info.required && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                            Requerida
                          </span>
                        )}
                      </div>
                      {info.description && <p className="text-xs text-gray-500 mt-1">{info.description}</p>}
                    </div>
                    <span className={`text-xs font-medium ${info.exists ? "text-green-600" : "text-red-600"}`}>
                      {info.exists ? "Configurada" : "No configurada"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shopify" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-lg font-medium mb-2">Conexión a Shopify</h3>
              <div
                className={`p-3 rounded-md ${
                  diagnosticData.shopify.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {diagnosticData.shopify.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {diagnosticData.shopify.success ? "Conexión exitosa" : "Error de conexión"}
                  </span>
                </div>
                <p className="mt-1 text-sm">{diagnosticData.shopify.message}</p>

                {diagnosticData.shopify.success && diagnosticData.shopify.data && diagnosticData.shopify.data.shop && (
                  <div className="mt-3 p-3 bg-white rounded-md border">
                    <h4 className="font-medium text-sm mb-2">Información de la tienda:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <strong>Nombre:</strong> {diagnosticData.shopify.data.shop.name}
                      </li>
                      {diagnosticData.shopify.data.shop.id && (
                        <li>
                          <strong>ID:</strong> {diagnosticData.shopify.data.shop.id}
                        </li>
                      )}
                      {diagnosticData.shopify.data.shop.url && (
                        <li>
                          <strong>URL:</strong> {diagnosticData.shopify.data.shop.url}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {!diagnosticData.shopify.success && diagnosticData.shopify.details && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-1">Detalles del error:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {Array.isArray(diagnosticData.shopify.details)
                        ? diagnosticData.shopify.details.map((detail, index) => <li key={index}>{detail}</li>)
                        : typeof diagnosticData.shopify.details === "string" && (
                            <li>{diagnosticData.shopify.details}</li>
                          )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-lg font-medium mb-2">Conexión a la base de datos</h3>
              <div
                className={`p-3 rounded-md ${
                  diagnosticData.database.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {diagnosticData.database.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {diagnosticData.database.success ? "Conexión exitosa" : "Error de conexión"}
                  </span>
                </div>
                <p className="mt-1 text-sm">{diagnosticData.database.message}</p>

                {!diagnosticData.database.success && diagnosticData.database.details && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-1">Detalles del error:</h4>
                    <p className="text-sm">{diagnosticData.database.details}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={runDiagnostics} className="mt-6 w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar diagnóstico
        </Button>
      </CardContent>
    </Card>
  )
}
