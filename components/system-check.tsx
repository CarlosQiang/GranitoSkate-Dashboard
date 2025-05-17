"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function SystemCheck() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkSystem = async () => {
    try {
      setStatus("loading")
      setError(null)

      const response = await fetch("/api/system/check")
      const result = await response.json()

      setData(result)
      setStatus(result.success ? "success" : "error")

      if (!result.success && result.message) {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error al verificar el sistema:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al verificar el sistema")
    }
  }

  useEffect(() => {
    checkSystem()
  }, [])

  return (
    <Card className="bg-white border-granito">
      <CardHeader className="bg-granito/10">
        <CardTitle className="text-granito-dark">Verificación del Sistema</CardTitle>
        <CardDescription>Verifica la configuración y conexiones del sistema</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {status === "loading" && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-granito" />
            <p>Verificando sistema...</p>
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error en el sistema</AlertTitle>
            <AlertDescription>
              {error || "No se pudo verificar el sistema"}

              {data && (
                <div className="mt-4 space-y-4">
                  {/* Configuración */}
                  <div>
                    <h4 className="font-semibold">Configuración:</h4>
                    <div className="mt-2 text-sm">
                      <h5 className="font-medium">Shopify:</h5>
                      <ul className="list-disc pl-5 mt-1">
                        <li>API URL: {data.config?.shopify?.apiUrl}</li>
                        <li>Access Token: {data.config?.shopify?.accessToken}</li>
                        <li>Shop Domain: {data.config?.shopify?.shopDomain}</li>
                      </ul>
                    </div>
                    <div className="mt-2 text-sm">
                      <h5 className="font-medium">Base de datos:</h5>
                      <ul className="list-disc pl-5 mt-1">
                        <li>URL: {data.config?.database?.url}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Conexión con Shopify */}
                  <div>
                    <h4 className="font-semibold">Conexión con Shopify:</h4>
                    <div className="mt-2 text-sm">
                      <p>Estado: {data.shopifyConnection?.success ? "Exitosa" : "Fallida"}</p>
                      <p>Mensaje: {data.shopifyConnection?.message}</p>
                    </div>
                  </div>

                  {/* Conexión con la base de datos */}
                  <div>
                    <h4 className="font-semibold">Conexión con la base de datos:</h4>
                    <div className="mt-2 text-sm">
                      <p>Estado: {data.dbConnection?.connected ? "Exitosa" : "Fallida"}</p>
                      {data.dbConnection?.error && <p>Error: {data.dbConnection.error}</p>}
                    </div>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Sistema verificado correctamente</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-4">
                {/* Conexión con Shopify */}
                <div>
                  <h4 className="font-semibold">Conexión con Shopify:</h4>
                  <div className="mt-2 text-sm">
                    <p>Estado: Exitosa</p>
                    <p>Mensaje: {data.shopifyConnection?.message}</p>
                  </div>
                </div>

                {/* Conexión con la base de datos */}
                <div>
                  <h4 className="font-semibold">Conexión con la base de datos:</h4>
                  <div className="mt-2 text-sm">
                    <p>Estado: Exitosa</p>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={checkSystem}
          disabled={status === "loading"}
          className="bg-granito hover:bg-granito-dark text-white"
        >
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar de nuevo"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
