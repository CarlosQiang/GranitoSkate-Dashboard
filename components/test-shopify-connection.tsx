"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function TestShopifyConnection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const [shopInfo, setShopInfo] = useState<any>(null)

  const testConnection = async () => {
    setStatus("loading")
    setMessage("Probando conexión con Shopify...")
    setShopInfo(null)

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

      if (response.ok && data.success) {
        setStatus("success")
        setMessage(data.message || "Conexión exitosa con Shopify")
        setShopInfo(data.data || null)
      } else {
        setStatus("error")
        setMessage(data.message || "Error al conectar con Shopify")
      }
    } catch (error) {
      console.error("Error al probar conexión con Shopify:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Error desconocido al probar conexión con Shopify")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prueba de Conexión a Shopify</CardTitle>
        <CardDescription>Realiza una prueba de conexión a la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Probando conexión...</span>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Conexión exitosa</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {shopInfo && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Información de la tienda:</h3>
            <div className="rounded-md border p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Nombre:</div>
                <div>{shopInfo.shop?.name || "No disponible"}</div>
                {shopInfo.shop?.id && (
                  <>
                    <div className="font-medium">ID:</div>
                    <div className="font-mono text-xs">{shopInfo.shop.id}</div>
                  </>
                )}
                {shopInfo.shop?.url && (
                  <>
                    <div className="font-medium">URL:</div>
                    <div>
                      <a
                        href={shopInfo.shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shopInfo.shop.url}
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
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

export default TestShopifyConnection
