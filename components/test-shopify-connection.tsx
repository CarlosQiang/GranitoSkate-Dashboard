"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function TestShopifyConnection() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [connectionData, setConnectionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      setStatus("loading")
      setError(null)

      const response = await fetch("/api/shopify/test-connection")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al probar la conexión con Shopify")
      }

      setConnectionData(data)
      setStatus(data.success ? "success" : "error")

      if (!data.success && data.message) {
        setError(data.message)
      }
    } catch (err) {
      console.error("Error al probar la conexión con Shopify:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al probar la conexión con Shopify")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexión a Shopify</CardTitle>
        <CardDescription>Verifica la conexión con la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <p>Probando conexión con Shopify...</p>
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              {error || "No se pudo conectar con Shopify"}

              {connectionData && connectionData.details && (
                <div className="mt-2 text-sm">
                  <p>Detalles del error:</p>
                  <pre className="mt-1 p-2 bg-gray-800 text-white rounded text-xs overflow-auto">
                    {typeof connectionData.details === "string"
                      ? connectionData.details
                      : JSON.stringify(connectionData.details, null, 2)}
                  </pre>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Conexión exitosa</AlertTitle>
            <AlertDescription>
              {connectionData.message || "Conexión exitosa con Shopify"}
              {connectionData.data && connectionData.data.shop && (
                <div className="mt-2 text-sm">
                  <p>Información de la tienda:</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <strong>Nombre:</strong> {connectionData.data.shop.name}
                    </li>
                    {connectionData.data.shop.id && (
                      <li>
                        <strong>ID:</strong> {connectionData.data.shop.id}
                      </li>
                    )}
                    {connectionData.data.shop.url && (
                      <li>
                        <strong>URL:</strong> {connectionData.data.shop.url}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Probando...
            </>
          ) : (
            "Probar conexión"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
