"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, CheckCircle, Settings } from "lucide-react"
import { LoadingState } from "@/components/loading-state"
import Link from "next/link"

export function ShopifyConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "not-configured">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [shopName, setShopName] = useState<string | null>(null)

  async function checkConnection() {
    try {
      setStatus("loading")

      // Primero verificar si las variables están configuradas
      const configResponse = await fetch("/api/system/config-check")
      const configData = await configResponse.json()

      if (!configData.shopify) {
        setStatus("not-configured")
        setErrorDetails("Variables de entorno de Shopify no configuradas")
        return
      }

      // Si están configuradas, probar la conexión
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
        setShopName(data.shopName || data.data?.shop?.name)
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

  if (status === "not-configured") {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm sm:text-base">Shopify no configurado</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          <p>Las variables de entorno de Shopify no están configuradas.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Link href="/dashboard/setup">
              <Button size="sm" className="w-full sm:w-auto">
                <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Configurar Shopify
              </Button>
            </Link>
            <Button onClick={checkConnection} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Verificar de nuevo
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm sm:text-base">Error de conexión con Shopify</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          <p>No se pudo conectar con la API de Shopify. Por favor, verifica:</p>
          <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
            <li>Que el dominio de la tienda sea correcto</li>
            <li>Que el token de acceso sea válido y tenga los permisos necesarios</li>
            <li>Que la tienda esté activa y accesible</li>
          </ul>
          {errorDetails && (
            <div className="mt-2 p-2 bg-destructive/10 rounded text-xs sm:text-sm font-mono overflow-auto max-h-32">
              {errorDetails}
            </div>
          )}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Link href="/dashboard/setup">
              <Button size="sm" className="w-full sm:w-auto">
                <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Revisar configuración
              </Button>
            </Link>
            <Button onClick={checkConnection} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Reintentar conexión
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
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
