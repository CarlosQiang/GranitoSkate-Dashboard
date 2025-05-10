"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="max-w-md">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Error del servidor</h1>
            <p className="mb-6 text-gray-600">
              Estamos experimentando algunos problemas técnicos. Nuestro equipo ha sido notificado y está trabajando
              para resolverlo lo antes posible.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Button onClick={reset} className="bg-brand hover:bg-brand-dark">
                Intentar de nuevo
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Volver al inicio</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
