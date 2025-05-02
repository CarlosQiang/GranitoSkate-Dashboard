"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DashboardErrorBoundary({
  children,
}: {
  children: React.ReactNode
}) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error capturado por DashboardErrorBoundary:", event.error)
      setError(event.error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error en el Dashboard</AlertTitle>
          <AlertDescription>
            Ha ocurrido un error al cargar el dashboard. Por favor, intenta recargar la página.
            {error && (
              <div className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-gray-100 rounded">{error.message}</div>
            )}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            setHasError(false)
            window.location.reload()
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Recargar página
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
