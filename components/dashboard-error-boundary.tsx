"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error capturado por DashboardErrorBoundary:", event.error)
      setErrorMessage(event.error?.message || "Error desconocido")
      setHasError(true)
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  if (hasError) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error en el Dashboard</AlertTitle>
          <AlertDescription>
            <p>Ha ocurrido un error al cargar el dashboard:</p>
            <p className="mt-2 text-sm font-mono bg-slate-800 text-white p-2 rounded overflow-auto">{errorMessage}</p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Recargar página
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
