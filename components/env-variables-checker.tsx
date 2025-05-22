"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function EnvVariablesChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [variables, setVariables] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkEnvVariables = async () => {
    try {
      setStatus("loading")
      setError(null)

      const response = await fetch("/api/system/env-check")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar las variables de entorno")
      }

      setVariables(data)
      setStatus(data.allRequired ? "success" : "error")
    } catch (err) {
      console.error("Error al verificar las variables de entorno:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al verificar las variables de entorno")
    }
  }

  useEffect(() => {
    checkEnvVariables()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables de Entorno</CardTitle>
        <CardDescription>Verifica las variables de entorno necesarias para la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <p>Verificando variables de entorno...</p>
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Faltan variables de entorno</AlertTitle>
            <AlertDescription>
              {error || "Algunas variables de entorno requeridas no están configuradas"}

              {variables && variables.variables && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold">Estado de las variables:</p>
                  <ul className="space-y-1">
                    {Object.entries(variables.variables).map(([name, info]: [string, any]) => (
                      <li key={name} className="flex items-start">
                        <span className={`mr-2 ${info.exists ? "text-green-500" : "text-red-500"}`}>
                          {info.exists ? "✓" : "✗"}
                        </span>
                        <div>
                          <span className="font-medium">{name}</span>
                          <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                            {info.required ? "Requerida" : "Opcional"}
                          </span>
                          {!info.exists && info.required && (
                            <p className="text-xs text-red-500 mt-0.5">Esta variable es necesaria</p>
                          )}
                          {info.description && <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Variables de entorno configuradas correctamente</AlertTitle>
            <AlertDescription>
              Todas las variables de entorno requeridas están configuradas correctamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkEnvVariables} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar de nuevo"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
