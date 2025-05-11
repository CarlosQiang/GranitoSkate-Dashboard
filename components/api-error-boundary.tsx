"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ApiErrorBoundaryProps {
  children: React.ReactNode
}

export function ApiErrorBoundary({ children }: ApiErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    // Verificar la conexión con la API
    const checkApiConnection = async () => {
      try {
        const response = await fetch("/api/health")
        if (!response.ok) {
          throw new Error(`Error de API: ${response.status}`)
        }
        const data = await response.json()
        if (data.status !== "ok") {
          setHasError(true)
          setErrorDetails(`Estado de la API: ${data.status}. ${data.message || ""}`)
        } else {
          setHasError(false)
          setErrorDetails(null)
        }
      } catch (error) {
        setHasError(true)
        setErrorDetails(`Error al conectar con la API: ${(error as Error).message}`)
      }
    }

    checkApiConnection()
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  if (hasError) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>
            <p>No se pudo conectar con la API de Shopify. Por favor, verifica:</p>
            <ul className="list-disc pl-5 mt-2 mb-4">
              <li>Que las variables de entorno estén configuradas correctamente</li>
              <li>Que el token de acceso a Shopify sea válido</li>
              <li>Que el dominio de la tienda sea correcto</li>
            </ul>
            {errorDetails && (
              <div className="mt-2 p-2 bg-destructive/10 rounded text-sm font-mono overflow-auto max-h-32">
                {errorDetails}
              </div>
            )}
            <Button onClick={handleRetry} className="mt-4" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
