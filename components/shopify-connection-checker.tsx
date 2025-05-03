"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { LoadingState } from "@/components/loading-state"

export function ShopifyConnectionChecker({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const checkConnection = async () => {
    setStatus("loading")
    try {
      // Intentar hacer una solicitud simple a través del proxy
      const response = await fetch("/api/shopify/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setStatus("connected")
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
    return <LoadingState message="Verificando conexión con Shopify..." />
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Shopify</AlertTitle>
        <AlertDescription>
          <p>No se pudo conectar con la API de Shopify. Por favor, verifica:</p>
          <ul className="list-disc pl-5 mt-2 mb-4">
            <li>Que el dominio de la tienda (NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) sea correcto</li>
            <li>Que el token de acceso (SHOPIFY_ACCESS_TOKEN) sea válido y tenga los permisos necesarios</li>
            <li>Que la tienda esté activa y accesible</li>
          </ul>
          {errorDetails && (
            <div className="mt-2 p-2 bg-destructive/10 rounded text-sm font-mono overflow-auto max-h-32">
              {errorDetails}
            </div>
          )}
          <Button onClick={checkConnection} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar conexión
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
