"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react"

interface ShopifyConnectionCheckerProps {
  onConnectionChange?: (connected: boolean) => void
}

// Exportamos tanto como función nombrada como por defecto para mantener compatibilidad
export function ShopifyConnectionChecker({ onConnectionChange }: ShopifyConnectionCheckerProps = {}) {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      const response = await fetch("/api/shopify/check", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setShopName(data.shopName || "")
        onConnectionChange?.(true) // Notify parent component
      } else {
        setStatus("error")
        setError(data.error || "Error desconocido al conectar con Shopify")
        onConnectionChange?.(false) // Notify parent component
      }
    } catch (err) {
      console.error("Error al verificar la conexión con Shopify:", err)
      setStatus("error")
      setError(`Error al verificar la conexión con Shopify: ${(err as Error).message}`)
      onConnectionChange?.(false) // Notify parent component
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <>
      {status === "loading" && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Verificando conexión con Shopify</AlertTitle>
          <AlertDescription>Estamos verificando la conexión con tu tienda Shopify...</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión con Shopify</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={isChecking}
              className="w-fit flex items-center gap-2"
            >
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reintentar conexión
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status === "connected" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Conectado a Shopify</AlertTitle>
          <AlertDescription className="text-green-700">
            Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

// También exportamos como default para mantener compatibilidad
export default ShopifyConnectionChecker
