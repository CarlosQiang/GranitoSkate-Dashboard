"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

export function ShopifyConnectionChecker() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch("/api/shopify/check")
        const data = await response.json()

        if (data.success) {
          setStatus("connected")
          setShopName(data.shopName || "")
        } else {
          setStatus("error")
          setErrorMessage(data.message || "No se pudo conectar con Shopify")
        }
      } catch (error) {
        setStatus("error")
        setErrorMessage("Error al verificar la conexión con Shopify")
        console.error("Error al verificar la conexión con Shopify:", error)
      }
    }

    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative mb-4">
        <span className="block sm:inline">Verificando conexión con Shopify...</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">Error de conexión con Shopify: {errorMessage}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative mb-4">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span className="block sm:inline">
          Conectado a Shopify
          {shopName && <span className="font-medium"> - Tienda: {shopName}</span>}
        </span>
      </div>
    </div>
  )
}
