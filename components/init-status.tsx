"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function InitStatus() {
  const [status, setStatus] = useState<{
    checked: boolean
    success: boolean
    message: string
  }>({
    checked: false,
    success: false,
    message: "Verificando inicialización...",
  })

  useEffect(() => {
    const checkInit = async () => {
      try {
        const response = await fetch("/api/init", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })

        if (!response.ok) {
          throw new Error("Error al verificar la inicialización")
        }

        const data = await response.json()

        setStatus({
          checked: true,
          success: data.success,
          message: data.message,
        })
      } catch (error) {
        setStatus({
          checked: true,
          success: false,
          message: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    checkInit()
  }, [])

  if (!status.checked) return null

  return (
    <Alert variant={status.success ? "default" : "destructive"} className="mb-4">
      {status.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>{status.success ? "Inicialización completada" : "Error de inicialización"}</AlertTitle>
      <AlertDescription>{status.message}</AlertDescription>
    </Alert>
  )
}
