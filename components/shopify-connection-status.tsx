"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export function ShopifyConnectionStatus() {
  const [shopInfo, setShopInfo] = useState<{ name: string; url: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/shopify/check", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error de servidor: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.shop) {
          setShopInfo(data.shop)
        } else {
          setError(data.message || "No se pudo conectar con Shopify")
        }
      } catch (error) {
        console.error("Error al verificar la conexión con Shopify:", error)
        setError("Error al verificar la conexión con Shopify")
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (isLoading || error || !shopInfo) {
    return null
  }

  return (
    <Alert className="mb-6 bg-green-50 border-green-200" data-shopify-connected="true">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado a Shopify</AlertTitle>
      <AlertDescription className="text-green-700">
        Conexión establecida correctamente con la tienda: {shopInfo.name}
      </AlertDescription>
    </Alert>
  )
}
