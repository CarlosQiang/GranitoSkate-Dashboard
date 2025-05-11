"use client"

import { useEffect, useState } from "react"
import { testShopifyConnection } from "@/lib/shopify"
import { CheckCircle, AlertCircle } from "lucide-react"

export function ShopifyConnectionChecker() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testShopifyConnection()
        if (result.success) {
          setStatus("connected")
          setShopName(result.data?.shop?.name || "")
        } else {
          setStatus("error")
          setErrorMessage(result.message || "Error desconocido")
        }
      } catch (error) {
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Error desconocido")
      }
    }

    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700 mr-2"></div>
          <p className="text-yellow-700">Verificando conexión con Shopify...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <p className="text-red-700 font-medium">Error de conexión con Shopify</p>
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        <div>
          <p className="text-green-700 font-medium">Conectado a Shopify</p>
          <p className="text-green-600 text-sm">Conexión establecida correctamente con la tienda: {shopName}</p>
        </div>
      </div>
    </div>
  )
}
