"use client"

import { useEffect } from "react"

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Error Crítico</h1>
            <p className="text-gray-600 mb-6">La aplicación ha encontrado un error crítico y no puede continuar.</p>
            <button
              onClick={reset}
              className="bg-[#d29a43] hover:bg-[#b88535] text-white font-bold py-2 px-6 rounded-md transition-colors"
            >
              Reiniciar aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
