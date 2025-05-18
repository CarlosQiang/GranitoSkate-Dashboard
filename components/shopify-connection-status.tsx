"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { LoadingState } from "@/components/loading-state"
import { ShopifyFallback } from "@/components/shopify-fallback"

export function ShopifyConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "hidden">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [shopName, setShopName] = useState<string | null>(null)

  async function checkConnection() {
    // Si no necesitas la integración con Shopify, simplemente oculta el componente
    setStatus("hidden")
    return

    // El código original se mantiene pero no se ejecutará
    try {
      setStatus("loading")
      const response = await fetch("/api/shopify/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setShopName(data.shopName)
        setErrorDetails(null)
      } else {
        throw new Error(data.error || "Error desconocido al conectar con Shopify")
      }
    } catch (error) {
      console.error("Error al verificar la conexión con Shopify:", error)
      setStatus("error")
      setErrorDetails((error as Error).message)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <div className="mb-4">
        <LoadingState message="Verificando conexión con Shopify..." />
      </div>
    )
  }

  if (status === "error") {
    return <ShopifyFallback />
  }

  if (status === "connected") {
    return (
      <div className="mb-4">
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-sm sm:text-base">Conectado a Shopify</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return null
}
