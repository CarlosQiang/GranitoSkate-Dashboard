"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { LoadingState } from "@/components/loading-state"

export function ShopifyConnectionChecker({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "hidden">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  // Verificar si ya existe un mensaje de conexión exitosa
  const checkForSuccessMessage = () => {
    const successMessage = document.querySelector('[data-shopify-connected="true"]')
    return !!successMessage
  }

  const checkConnection = async () => {
    // Si ya hay un mensaje de conexión exitosa, no mostramos nada
    if (checkForSuccessMessage()) {
      setStatus("hidden")
      return
    }

    setStatus("loading")
    try {
      // Intentar hacer una solicitud simple a través del proxy
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
        setErrorDetails(null)
      } else {
        // Si hay un error pero ya existe un mensaje de éxito, no mostramos nada
        if (checkForSuccessMessage()) {
          setStatus("hidden")
          return
        }
        throw new Error(data.error || "Error desconocido al conectar con Shopify")
      }
    } catch (error) {
      console.error("Error al verificar la conexión con Shopify:", error)

      // Si hay un error pero ya existe un mensaje de éxito, no mostramos nada
      if (checkForSuccessMessage()) {
        setStatus("hidden")
        return
      }

      setStatus("error")
      setErrorDetails((error as Error).message)
    }
  }

  useEffect(() => {
    // Esperar un momento para que otros componentes se carguen primero
    const timer = setTimeout(() => {
      checkConnection()
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Si el estado es "hidden", no mostramos nada
  if (status === "hidden") {
    return <>{children}</>
  }

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
