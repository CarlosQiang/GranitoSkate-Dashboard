"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ShopifyConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/shopify/check")
        const data = await response.json()

        if (data.success) {
          setStatus("connected")
          setShopName(data.shopName || "")
        } else {
          setStatus("error")
          setErrorMessage(data.message || "Error al conectar con Shopify")
        }
      } catch (error) {
        setStatus("error")
        setErrorMessage("Error al verificar la conexión con Shopify")
      }
    }

    checkConnection()

    // Ocultar después de 10 segundos si está conectado
    const timer = setTimeout(() => {
      if (status === "connected") {
        setIsVisible(false)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [status])

  if (!isVisible) return null

  if (status === "loading") {
    return (
      <Alert className="mb-4 bg-gray-100">
        <div className="flex items-center">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-brand"></div>
          <AlertTitle>Verificando conexión con Shopify...</AlertTitle>
        </div>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado a Shopify</AlertTitle>
      <AlertDescription className="text-green-700">
        Conexión establecida correctamente con la tienda: {shopName}
      </AlertDescription>
    </Alert>
  )
}
