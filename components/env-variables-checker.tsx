"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function EnvVariablesChecker() {
  const [envStatus, setEnvStatus] = useState<{
    loading: boolean
    error: string | null
    variables: Record<string, { name: string; exists: boolean; value?: string }>
  }>({
    loading: true,
    error: null,
    variables: {},
  })

  useEffect(() => {
    checkEnvVariables()
  }, [])

  const checkEnvVariables = async () => {
    setEnvStatus((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await fetch("/api/system/env-check")
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setEnvStatus({
        loading: false,
        error: null,
        variables: data.variables,
      })
    } catch (error) {
      setEnvStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar variables de entorno",
        variables: {},
      })
    }
  }

  const getMissingVariables = () => {
    return Object.values(envStatus.variables).filter((v) => !v.exists)
  }

  const getExistingVariables = () => {
    return Object.values(envStatus.variables).filter((v) => v.exists)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Verificación de Variables de Entorno
        </CardTitle>
        <CardDescription>
          Comprueba si las variables de entorno necesarias están configuradas correctamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {envStatus.loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : envStatus.error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{envStatus.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Variables faltantes:</h3>
              {getMissingVariables().length === 0 ? (
                <p className="text-sm text-muted-foreground">Todas las variables necesarias están configuradas.</p>
              ) : (
                <ul className="space-y-2">
                  {getMissingVariables().map((variable) => (
                    <li key={variable.name} className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="h-4 w-4" />
                      {variable.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Variables configuradas:</h3>
              {getExistingVariables().length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay variables configuradas.</p>
              ) : (
                <ul className="space-y-2">
                  {getExistingVariables().map((variable) => (
                    <li key={variable.name} className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {variable.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkEnvVariables} variant="outline" className="w-full">
          Verificar de nuevo
        </Button>
      </CardFooter>
    </Card>
  )
}
