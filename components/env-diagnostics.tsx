"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function EnvDiagnostics() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkEnvVars = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/diagnostics/env-check", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.error || "Error desconocido al verificar variables de entorno")
      }
    } catch (err) {
      console.error("Error al verificar variables de entorno:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico de Variables de Entorno</CardTitle>
        <CardDescription>
          Verifica si las variables de entorno necesarias están configuradas correctamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && result.success && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Variables configuradas correctamente</AlertTitle>
            <AlertDescription>Todas las variables de entorno necesarias están configuradas.</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Estado de las variables:</h3>
            <ul className="space-y-1 text-sm">
              {Object.entries(result.variables || {}).map(([key, value]: [string, any]) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="font-mono">{key}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {value ? "Definida" : "No definida"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkEnvVars} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar Variables de Entorno"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
