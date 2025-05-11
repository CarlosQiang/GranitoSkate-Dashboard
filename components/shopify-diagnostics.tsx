"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react"

export function ShopifyDiagnostics() {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setIsChecking(true)
    setError(null)

    try {
      // Verificar variables de entorno
      const envCheck = {
        NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "✅" : "❌",
        SHOPIFY_ACCESS_TOKEN: "⚠️ No verificable en el cliente",
        SHOPIFY_API_URL: process.env.SHOPIFY_API_URL ? "✅" : "❌",
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? "✅" : "❌",
        NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL ? "✅" : "❌",
      }

      // Verificar conexión con Shopify
      const response = await fetch("/api/shopify/check?retry=1", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      const data = await response.json()

      setResults({
        timestamp: new Date().toISOString(),
        environmentVariables: envCheck,
        shopifyConnection: data,
      })
    } catch (err) {
      console.error("Error al ejecutar diagnósticos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico de Conexión con Shopify</CardTitle>
        <CardDescription>Verifica la configuración y conexión con la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Variables de Entorno</h3>
              <div className="bg-muted p-3 rounded-md text-sm">
                <pre className="whitespace-pre-wrap">
                  {Object.entries(results.environmentVariables).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value as string}
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Conexión con Shopify</h3>
              <div className="bg-muted p-3 rounded-md text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(results.shopifyConnection, null, 2)}</pre>
              </div>
            </div>

            {results.shopifyConnection.success ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Conexión exitosa</AlertTitle>
                <AlertDescription className="text-green-700">
                  Se ha establecido conexión con la tienda: {results.shopifyConnection.shopName}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de conexión</AlertTitle>
                <AlertDescription>
                  {results.shopifyConnection.error || "No se pudo conectar con Shopify"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!results && !error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Haz clic en "Ejecutar diagnóstico" para verificar la conexión con Shopify
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runDiagnostics} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
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
