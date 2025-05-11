"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorHandlerProps {
  error: Error | null
  resetError?: () => void
  message?: string
}

export function ErrorHandler({ error, resetError, message }: ErrorHandlerProps) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Registrar el error en la consola para depuración
    if (error) {
      console.error("Error capturado:", error)
    }
  }, [error])

  if (!error) return null

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p>{message || "Ha ocurrido un error al cargar los datos."}</p>

        {showDetails && (
          <div className="mt-2 p-2 bg-destructive/10 rounded text-sm font-mono overflow-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {resetError && (
            <Button variant="outline" size="sm" onClick={resetError} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Reintentar
            </Button>
          )}

          <Button variant="link" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Ocultar detalles" : "Mostrar detalles"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
