"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function ShopifyConnectionChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailedError, setDetailedError] = useState<string | null>(null)

  // Función para verificar si ya existe un mensaje de éxito
  const checkForSuccessMessage = () => {
    const successMessage = document.querySelector('[data-shopify-connected="true"]')
    return !!successMessage
  }

  const checkConnection = async () => {
    // Si ya hay un mensaje de éxito, no mostrar errores
    if (checkForSuccessMessage()) {
      setError(null)
      setDetailedError(null)
      return
    }

    setIsChecking(true)
    setError(null)
    setDetailedError(null)

    try {
      // Usar método GET en lugar de POST
      const response = await fetch("/api/shopify/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error de servidor: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.message || "Error desconocido al verificar la conexión con Shopify")
        setDetailedError(data.details || null)
      }
    } catch (error) {
      console.error("Error al verificar la conexión con Shopify:", error)
      setError("Error al verificar la conexión con Shopify")
      setDetailedError((error as Error).message || "Error desconocido")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Solo verificar la conexión si no hay un mensaje de éxito
    if (!checkForSuccessMessage()) {
      checkConnection()
    }
  }, [])

  // Si ya hay un mensaje de éxito, no mostrar nada
  if (checkForSuccessMessage()) {
    return null
  }

  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error de conexión con Shopify</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p>No se pudo conectar con la API de Shopify. Por favor, verifica:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Que el dominio de la tienda (NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) sea correcto</li>
            <li>Que el token de acceso (SHOPIFY_ACCESS_TOKEN) sea válido y tenga los permisos necesarios</li>
            <li>Que la tienda esté activa y accesible</li>
          </ul>
          {detailedError && <div className="mt-2 p-2 bg-red-50 text-red-800 text-sm rounded">{detailedError}</div>}
          <Button variant="outline" size="sm" className="mt-3" onClick={checkConnection} disabled={isChecking}>
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar conexión
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
