"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error de aplicación:", error)
  }, [error])

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error en la aplicación
          </CardTitle>
          <CardDescription>Ha ocurrido un error inesperado. Esto puede deberse a:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Tablas de base de datos faltantes</li>
            <li>• Componentes no implementados</li>
            <li>• Variables de entorno no configuradas</li>
          </ul>

          <div className="space-y-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <a href="/dashboard">Ir al Dashboard</a>
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Detalles del error (desarrollo)</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">{error.message}</pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
