"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function EnvDiagnostics() {
  const [loading, setLoading] = useState(false)
  const [envStatus, setEnvStatus] = useState<{
    success: boolean
    missingVars: string[]
    allVars: Record<string, string>
  } | null>(null)

  const checkEnvVars = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnostics/env-check", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      setEnvStatus({
        success: false,
        missingVars: [],
        allVars: {},
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvVars()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico de Variables de Entorno</CardTitle>
        <CardDescription>Verifica que todas las variables de entorno necesarias estén configuradas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {envStatus && (
          <Alert
            variant={envStatus.success ? "default" : "destructive"}
            className={envStatus.success ? "bg-green-50 border-green-200" : ""}
          >
            {envStatus.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {envStatus.success ? "Variables de entorno configuradas correctamente" : "Faltan variables de entorno"}
            </AlertTitle>
            <AlertDescription>
              {envStatus.success ? (
                "Todas las variables de entorno necesarias están configuradas."
              ) : (
                <div className="space-y-2">
                  <p>Las siguientes variables de entorno son necesarias pero no están configuradas:</p>
                  <ul className="list-disc pl-5">
                    {envStatus.missingVars.map((varName) => (
                      <li key={varName}>{varName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
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
            "Verificar variables de entorno"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
