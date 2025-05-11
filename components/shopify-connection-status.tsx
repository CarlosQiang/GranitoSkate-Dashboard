"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ShopifyConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isRetrying, setIsRetrying] = useState(false)

  async function checkConnection() {
    try {
      setStatus("loading")

      const response = await fetch("/api/shopify/check?retry=1", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        next: { revalidate: 0 },
      })

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setShopName(data.shopName || "")
      } else {
        setStatus("error")
        setErrorMessage(data.error || "No se pudo conectar con Shopify")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Error al verificar la conexión con Shopify")
      console.error("Error al verificar la conexión con Shopify:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    checkConnection()
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        <AlertTitle className="text-blue-800">Verificando conexión con Shopify</AlertTitle>
        <AlertDescription className="text-blue-700">
          Estamos verificando la conexión con tu tienda Shopify...
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Shopify</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{errorMessage}</p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              {isRetrying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reintentar
            </Button>
            <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
              <Link href="/dashboard/diagnostics/shopify">Diagnóstico</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado a Shopify</AlertTitle>
      <AlertDescription className="text-green-700">
        Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
      </AlertDescription>
    </Alert>
  )
}
