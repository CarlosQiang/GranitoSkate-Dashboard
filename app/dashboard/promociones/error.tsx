"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function PromocionesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error en página de promociones:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Error al cargar promociones</CardTitle>
          <CardDescription>
            Ha ocurrido un error al cargar la página de promociones. Por favor, inténtalo de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
