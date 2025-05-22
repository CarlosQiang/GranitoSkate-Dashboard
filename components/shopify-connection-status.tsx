"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ShopifyConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkShopifyConnection = async () => {
    setIsChecking(true)
    setStatus("loading")
    setMessage("Verificando conexión con Shopify...")

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
        setDetails(data.data || null)
      } else if (response.ok && data.warning) {
        setStatus("warning")
        setMessage(data.message || "Conexión con advertencias")
        setDetails(data.data || null)
      } else {
        setStatus("error")
        setMessage(data.message || "Error al conectar con Shopify")
        setDetails(data.error || null)
      }
    } catch (error) {
      console.error("Error al verificar conexión con Shopify:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Error desconocido al verificar conexión con Shopify")
      setDetails(null)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkShopifyConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          Conexión con Shopify
        </CardTitle>
        <CardDescription>Verifica la conexión con la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Verificando conexión con Shopify...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {status === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Error de conexión</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "warning" && (
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Conexión con advertencias</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Conexión exitosa</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {details && status === "success" && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Detalles de la tienda:</h3>
                <div className="rounded-md border p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Nombre:</div>
                    <div>{details.shop?.name || "No disponible"}</div>
                    {details.shop?.id && (
                      <>
                        <div className="font-medium">ID:</div>
                        <div className="font-mono text-xs">{details.shop.id}</div>
                      </>
                    )}
                    {details.shop?.url && (
                      <>
                        <div className="font-medium">URL:</div>
                        <div>
                          <a
                            href={details.shop.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {details.shop.url}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkShopifyConnection} disabled={isChecking} variant="outline" className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar conexión
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ShopifyConnectionStatus
