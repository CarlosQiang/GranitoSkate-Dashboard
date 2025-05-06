"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorHandlerProps {
  error: Error
  reset: () => void
}

export function ErrorHandler({ error, reset }: ErrorHandlerProps) {
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [showDetails, setShowDetails] = useState<boolean>(false)

  useEffect(() => {
    // Personalizar mensajes de error comunes
    if (error.message.includes("fetch")) {
      setErrorMessage("Error de conexión. Por favor, verifica tu conexión a internet.")
    } else if (error.message.includes("authentication")) {
      setErrorMessage("Error de autenticación. Por favor, inicia sesión nuevamente.")
    } else if (error.message.includes("permission")) {
      setErrorMessage("No tienes permisos para acceder a este recurso.")
    } else if (error.message.includes("Shopify")) {
      setErrorMessage("Error al conectar con Shopify. Verifica tus credenciales.")
    } else {
      setErrorMessage("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.")
    }

    // Registrar el error en la consola para depuración
    console.error("Error capturado:", error)
  }, [error])

  const handleReset = () => {
    // Intentar limpiar cualquier estado que pudiera estar causando el error
    localStorage.removeItem("errorState")
    sessionStorage.clear()

    // Llamar a la función reset proporcionada por Next.js
    reset()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>

      <div className="flex flex-col gap-4">
        <Button onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Intentar de nuevo
        </Button>

        <Button variant="outline" onClick={() => setShowDetails(!showDetails)} className="w-full">
          {showDetails ? "Ocultar detalles" : "Mostrar detalles"}
        </Button>

        {showDetails && (
          <div className="mt-4 p-4 bg-muted rounded-md overflow-auto">
            <p className="font-mono text-xs">{error.stack}</p>
          </div>
        )}

        <div className="text-center mt-4">
          <Button variant="link" asChild>
            <a href="/dashboard">Volver al Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
