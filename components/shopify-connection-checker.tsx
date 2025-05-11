"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function ShopifyConnectionChecker() {
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
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setShopName(data.shopName || "")
      } else {
        setStatus("error")
        setError(data.error || "Error desconocido al conectar con Shopify")
      }
    } catch (err) {
      console.error("Error al verificar la conexión con Shopify:", err)
      setStatus("error")
      setError(`Error al verificar la conexión con Shopify: ${(err as Error).message}`)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <Alert>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando conexión con Shopify</AlertTitle>
        <AlertDescription>Estamos verificando la conexión con tu tienda Shopify...</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Shopify</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={checkConnection} disabled={isChecking}>
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reintentar conexión
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="default" className="bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle>Conectado a Shopify</AlertTitle>
      <AlertDescription>
        Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
      </AlertDescription>
    </Alert>
  )
}
