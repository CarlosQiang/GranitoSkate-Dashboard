"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorHandlerProps {
  error: Error
  reset: () => void
}

export function ErrorHandler({ error, reset }: ErrorHandlerProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error no controlado:", error)
  }, [error])

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
        <h2 className="text-xl font-bold text-red-800">Algo salió mal</h2>
      </div>
      <p className="text-red-700 mb-4">Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.</p>
      <div className="flex gap-2">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
