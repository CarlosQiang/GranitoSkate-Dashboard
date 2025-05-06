"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { ShopifyConnectionChecker } from "./shopify-connection-checker"

export function SystemDiagnostics() {
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ success: boolean; message: string } | null>(null)

  const checkApiStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      setApiStatus({
        success: data.success,
        message: data.message,
      })
    } catch (error) {
      setApiStatus({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico del Sistema</CardTitle>
        <CardDescription>Verifica el estado de los componentes del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">API de la aplicación</h3>
          {apiStatus && (
            <Alert
              variant={apiStatus.success ? "default" : "destructive"}
              className={apiStatus.success ? "bg-green-50 border-green-200" : ""}
            >
              {apiStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{apiStatus.success ? "API funcionando correctamente" : "Error en la API"}</AlertTitle>
              <AlertDescription>{apiStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Conexión con Shopify</h3>
          <ShopifyConnectionChecker />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            checkApiStatus()
          }}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Ejecutar diagnóstico completo"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
