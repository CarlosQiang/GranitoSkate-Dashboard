"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ShopifyConnectionChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [shopName, setShopName] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      // Añadir un parámetro de timestamp para evitar el caché
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/shopify/check?t=${timestamp}&retry=${retryCount}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        // Aumentar el timeout para evitar problemas de conexión
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setShopName(data.shopName || "")
        setMessage(`Conexión establecida correctamente con la tienda: ${data.shopName || ""}`)
      } else {
        setStatus("error")
        setMessage(data.error || "Error al verificar la conexión con Shopify")
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error al verificar la conexión: ${(error as Error).message}`)
    } finally {
      setIsChecking(false)
    }
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    checkConnection()
  }

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  if (status === "loading" && isChecking) {
    return (
      <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando conexión con Shopify</AlertTitle>
        <AlertDescription>Espere un momento mientras verificamos la conexión...</AlertDescription>
      </Alert>
    )
  }

  if (status === "success") {
    return (
      <Alert className="mb-4 bg-green-50 text-green-800 border-green-200" data-shopify-connected="true">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Conectado a Shopify</AlertTitle>
        <AlertDescription className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
          <span>Conexión establecida correctamente con la tienda: {shopName}</span>
          <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry} disabled={isChecking}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Shopify</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <span>Error al verificar la conexión con Shopify: {message}</span>
          <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry} disabled={isChecking}>
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reintentando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar conexión
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
