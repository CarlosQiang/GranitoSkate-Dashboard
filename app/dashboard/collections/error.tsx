"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function CollectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis o en la consola
    console.error("Error en la página de colecciones:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">Error en la página de colecciones</h2>
        <p className="text-red-700 mb-6">
          Ha ocurrido un error al cargar la página de colecciones. Nuestro equipo ha sido notificado.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={reset} variant="outline">
            Intentar de nuevo
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")} variant="default">
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
