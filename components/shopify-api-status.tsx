"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { checkShopifyConnection } from "@/lib/shopify"

export function ShopifyApiStatus() {
  const [status, setStatus] = useState({
    checked: false,
    success: false,
    shopName: "",
    error: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true)
        const result = await checkShopifyConnection()
        setStatus({
          checked: true,
          success: result.success,
          shopName: result.shopName || result.shop?.name || "",
          error: result.error || null,
        })
      } catch (error) {
        setStatus({
          checked: true,
          success: false,
          shopName: "",
          error: error.message || "Error al verificar la conexión",
        })
      } finally {
        setLoading(false)
      }
    }

    // Solo verificar la conexión una vez
    if (!status.checked) {
      checkConnection()
    }
  }, [status.checked])

  // No mostrar nada mientras se carga
  if (loading && !status.checked) {
    return null
  }

  // No mostrar nada si ya se verificó y fue exitoso (para evitar duplicados)
  if (status.checked && status.success && sessionStorage.getItem("shopify-connection-verified") === "true") {
    return null
  }

  // Guardar en sessionStorage que ya se verificó la conexión
  if (status.checked && status.success) {
    sessionStorage.setItem("shopify-connection-verified", "true")
  }

  return (
    <>
      {status.success ? (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Conectado a Shopify - Tienda: {status.shopName}</AlertTitle>
          <AlertDescription>Conexión establecida correctamente con la tienda Shopify</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión con Shopify</AlertTitle>
          <AlertDescription>{status.error || "No se pudo establecer conexión con la tienda Shopify"}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
