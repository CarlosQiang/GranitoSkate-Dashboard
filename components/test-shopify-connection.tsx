"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export function TestShopifyConnection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)

  const testConnection = async () => {
    try {
      setStatus("loading")

      // Probar la conexión con el proxy
      const proxyResponse = await fetch("/api/shopify/products?limit=1")

      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text()
        throw new Error(`Error en la respuesta del proxy: ${proxyResponse.status} ${errorText}`)
      }

      const data = await proxyResponse.json()

      if (data.errors) {
        throw new Error(`Error en la respuesta de Shopify: ${JSON.stringify(data.errors)}`)
      }

      setResult(data)
      setStatus("success")
    } catch (error) {
      console.error("Error al probar la conexión con Shopify:", error)
      setResult(error instanceof Error ? error.message : "Error desconocido")
      setStatus("error")
    }
  }

  return (
    <Card className="bg-white border-granito">
      <CardHeader className="bg-granito/10">
        <CardTitle className="text-granito-dark">Prueba de conexión con Shopify</CardTitle>
        <CardDescription>Verifica la conexión con la API de Shopify a través del proxy</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {status === "loading" && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-granito" />
            <p>Probando conexión...</p>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Conexión exitosa</AlertTitle>
            <AlertDescription>
              <p>La conexión con Shopify a través del proxy funciona correctamente.</p>
              {result && (
                <div className="mt-2">
                  <p className="font-semibold">Productos encontrados: {result.data?.products?.edges?.length || 0}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              <p>No se pudo conectar con Shopify a través del proxy.</p>
              {result && <p className="mt-2 text-sm">{result}</p>}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={testConnection}
          disabled={status === "loading"}
          className="bg-granito hover:bg-granito-dark text-white"
        >
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
