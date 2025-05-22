"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export function TestShopifyConnection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setStatus("loading")
    setError(null)

    try {
      const response = await fetch("/api/shopify/test-connection", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setError(data.error || "Error desconocido al conectar con Shopify")
      }
    } catch (error) {
      console.error("Error al probar la conexión con Shopify:", error)
      setStatus("error")
      setError((error as Error).message || "Error de conexión")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          {status === "idle" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          Prueba de Conexión a Shopify
        </CardTitle>
        <CardDescription>Realiza una prueba completa de conexión a la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Prueba no iniciada</AlertTitle>
            <AlertDescription>Haz clic en el botón para probar la conexión con Shopify.</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Probando conexión con Shopify...</span>
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              {result && result.env && (
                <div className="mt-2">
                  <p className="font-semibold">Estado de las variables de entorno:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                    <li>SHOPIFY_API_URL: {result.env.SHOPIFY_API_URL}</li>
                    <li>SHOPIFY_ACCESS_TOKEN: {result.env.SHOPIFY_ACCESS_TOKEN}</li>
                    <li>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: {result.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Conexión exitosa</AlertTitle>
            <AlertDescription>
              <p>Se ha establecido conexión correctamente con la tienda Shopify.</p>
              {result && result.shop && (
                <div className="mt-2">
                  <p>
                    <strong>Nombre de la tienda:</strong> {result.shop.name}
                  </p>
                  {result.shop.primaryDomain && (
                    <Link
                      href={result.shop.primaryDomain.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      Visitar tienda <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={status === "loading"} variant="outline" className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Probando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Probar conexión
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
