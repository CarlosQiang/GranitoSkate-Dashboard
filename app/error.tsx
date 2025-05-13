"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis de errores
    console.error("Error en la aplicación:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">¡Algo salió mal!</h1>
      <p className="text-lg mb-6">Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.</p>
      {error.digest && <p className="text-sm text-gray-500 mb-6">Código de error: {error.digest}</p>}
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-[#c59d45] hover:bg-[#b38d35] text-white">
          Intentar de nuevo
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
