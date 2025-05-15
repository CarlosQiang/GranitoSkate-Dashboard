"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ShopifyConnectionChecker() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)
  const [details, setDetails] = useState<any>(null)

  async function checkConnection() {
    try {
      setIsChecking(true)
      setStatus("loading")

      console.log("Verificando conexión con Shopify...")

      // Añadir un parámetro de timestamp para evitar caché
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/shopify/check?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Respuesta de verificación:", data)

      if (data.success) {
        setStatus("connected")
        setShopName(data.shopName || "")
        setDetails(data)
      } else {
        setStatus("error")
        setErrorMessage(data.message || "No se pudo conectar con Shopify")
        setDetails(data)
      }
    } catch (error) {
      console.error("Error al verificar la conexión con Shopify:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-blue-50 border border-blue-200 text-blue-800">
        <div className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          <div>
            <AlertTitle>Verificando conexión con Shopify</AlertTitle>
            <AlertDescription>Comprobando la conexión con tu tienda Shopify...</AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div className="flex-1">
            <AlertTitle>Error de conexión con Shopify</AlertTitle>
            <AlertDescription className="mt-1">
              {errorMessage}
              {details && details.details && (
                <div className="mt-2 text-sm">
                  <strong>Detalles adicionales:</strong> {details.details}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={checkConnection}
                disabled={isChecking}
                className="mt-2 flex items-center gap-2"
              >
                {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Reintentar conexión
              </Button>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border border-green-200 text-green-800">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 mr-2" />
        <div>
          <AlertTitle>Conectado a Shopify</AlertTitle>
          <AlertDescription>
            Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
            {details && details.apiVersion && <div className="text-sm mt-1">Versión de API: {details.apiVersion}</div>}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
