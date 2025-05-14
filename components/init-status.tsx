"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InitStatus() {
  const [status, setStatus] = useState<{
    checked: boolean
    success: boolean
    message: string
    isLoading: boolean
  }>({
    checked: false,
    success: false,
    message: "Verificando inicialización...",
    isLoading: true,
  })

  const checkInitialization = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }))
    try {
      const response = await fetch("/api/init", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      const data = await response.json()

      setStatus({
        checked: true,
        success: data.success,
        message: data.message || "Inicialización completada correctamente",
        isLoading: false,
      })
    } catch (error) {
      setStatus({
        checked: true,
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        isLoading: false,
      })
    }
  }

  useEffect(() => {
    checkInitialization()
  }, [])

  if (!status.checked && status.isLoading) {
    return (
      <Alert variant="default" className="w-full mb-4 bg-muted/50">
        <div className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <AlertTitle>Verificando estado del sistema...</AlertTitle>
        </div>
      </Alert>
    )
  }

  return (
    <Alert variant={status.success ? "default" : "destructive"} className="w-full mb-4">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start">
          {status.success ? (
            <CheckCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          )}
          <div>
            <AlertTitle className="text-sm font-medium">
              {status.success ? "Inicialización completada" : "Error de inicialización"}
            </AlertTitle>
            <AlertDescription className="text-sm break-words max-w-[90%]">{status.message}</AlertDescription>
          </div>
        </div>
        {!status.success && (
          <Button
            variant="outline"
            size="sm"
            onClick={checkInitialization}
            disabled={status.isLoading}
            className="ml-2 flex-shrink-0"
          >
            {status.isLoading ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Verificando...
              </>
            ) : (
              "Reintentar"
            )}
          </Button>
        )}
      </div>
    </Alert>
  )
}
