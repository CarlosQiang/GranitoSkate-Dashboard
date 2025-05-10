"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error para depuración
    console.error("Error en la aplicación:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Ha ocurrido un error</CardTitle>
          <CardDescription>{error.message || "Se ha producido un error inesperado en la aplicación."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium">Información de diagnóstico:</p>
            <p className="mt-1 break-words font-mono text-xs">
              {error.digest ? `Digest: ${error.digest}` : "No hay información adicional disponible."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={reset} className="w-full" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
