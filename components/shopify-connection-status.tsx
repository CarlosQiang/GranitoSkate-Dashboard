"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ShopifyConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [shopName, setShopName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/shopify/check")

        if (!response.ok) {
          throw new Error("Error al verificar la conexión con Shopify")
        }

        const data = await response.json()

        if (data.success) {
          setIsConnected(true)
          setShopName(data.shop || "QiangTheme")
        } else {
          setIsConnected(false)
          setError(data.error || "No se pudo conectar con Shopify")
        }
      } catch (err) {
        console.error("Error al verificar la conexión:", err)
        setIsConnected(false)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (isLoading) {
    return null // No mostrar nada mientras carga
  }

  if (!isConnected) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error de conexión con Shopify: {error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="success" className="bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-700">
        Conectado a Shopify
        <span className="font-medium ml-1">Conexión establecida correctamente con la tienda: {shopName}</span>
      </AlertDescription>
    </Alert>
  )
}
