"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">¡Algo salió mal!</h1>
        <p className="text-gray-600 mb-6">{error.message || "Ha ocurrido un error inesperado."}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-[#d29a43] hover:bg-[#b88535] text-white font-bold py-2 px-6 rounded-md transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/dashboard"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
