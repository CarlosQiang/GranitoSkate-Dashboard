"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function SystemConfigChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [configData, setConfigData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkConfig = async () => {
    try {
      setStatus("loading")
      setError(null)

      const response = await fetch("/api/system/config-check")
      const data = await response.json()

      setConfigData(data)
      setStatus(data.success ? "success" : "error")

      if (!data.success && data.message) {
        setError(data.message)
      }
    } catch (err) {
      console.error("Error al verificar la configuración del sistema:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al verificar la configuración")
    }
  }

  useEffect(() => {
    checkConfig()
  }, [])

  return (
    <Card className="bg-white border-granito">
      <CardHeader className="bg-granito/10">
        <CardTitle className="text-granito-dark">Configuración del Sistema</CardTitle>
        <CardDescription>Verifica la configuración general del sistema</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {status === "loading" && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-granito" />
            <p>Verificando configuración...</p>
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de configuración</AlertTitle>
            <AlertDescription>
              {error || "No se pudo verificar la configuración del sistema"}

              {configData && (
                <div className="mt-2 text-sm">
                  <p>Estado de la configuración:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {configData.config &&
                      Object.entries(configData.config).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                  </ul>

                  {configData.errors && configData.errors.length > 0 && (
                    <div className="mt-2">
                      <p>Errores detectados:</p>
                      <ul className="list-disc pl-5 mt-1">
                        {configData.errors.map((err: string, index: number) => (
                          <li key={index}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Configuración correcta</AlertTitle>
            <AlertDescription>
              La configuración del sistema es correcta.
              {configData && configData.message && (
                <div className="mt-2 text-sm">
                  <p>{configData.message}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={checkConfig}
          disabled={status === "loading"}
          className="bg-granito hover:bg-granito-dark text-white"
        >
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
