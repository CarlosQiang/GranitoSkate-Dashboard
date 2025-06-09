"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <CardTitle className="text-2xl">Error en la página</CardTitle>
          <CardDescription>Ha ocurrido un error al cargar esta página.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && (
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">Error ID: {error.digest}</div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
