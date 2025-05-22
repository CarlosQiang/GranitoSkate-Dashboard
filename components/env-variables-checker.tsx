"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EnvVariablesChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [variables, setVariables] = useState<
    Array<{
      name: string
      status: "ok" | "missing" | "error"
      value?: string
      description?: string
      required?: boolean
    }>
  >([])
  const [isChecking, setIsChecking] = useState(false)

  const checkEnvVariables = async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      const response = await fetch("/api/system/env-check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok) {
        setVariables(data.variables || [])

        // Determinar el estado general
        const missingRequired = data.variables?.some((v) => v.required && v.status === "missing") || false
        const missingOptional = data.variables?.some((v) => !v.required && v.status === "missing") || false

        if (missingRequired) {
          setStatus("error")
        } else if (missingOptional) {
          setStatus("warning")
        } else {
          setStatus("success")
        }
      } else {
        setStatus("error")
        setVariables([])
      }
    } catch (error) {
      console.error("Error al verificar variables de entorno:", error)
      setStatus("error")
      setVariables([])
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkEnvVariables()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          Variables de Entorno
        </CardTitle>
        <CardDescription>Verifica las variables de entorno necesarias para la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Verificando variables de entorno...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {status === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Faltan variables de entorno requeridas</AlertTitle>
                <AlertDescription>
                  Algunas variables de entorno requeridas no están configuradas. La aplicación puede no funcionar
                  correctamente.
                </AlertDescription>
              </Alert>
            )}

            {status === "warning" && (
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Faltan algunas variables opcionales</AlertTitle>
                <AlertDescription>
                  Algunas variables de entorno opcionales no están configuradas. La aplicación puede tener funcionalidad
                  limitada.
                </AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Variables de entorno configuradas correctamente</AlertTitle>
                <AlertDescription>Todas las variables de entorno necesarias están configuradas.</AlertDescription>
              </Alert>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Estado de las variables:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {variables.map((variable, index) => (
                  <div key={index} className="flex items-start justify-between p-2 border rounded-md">
                    <div>
                      <div className="flex items-center gap-2">
                        {variable.status === "ok" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {variable.status === "missing" && <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="font-mono text-xs">{variable.name}</span>
                      </div>
                      {variable.description && <p className="text-xs text-gray-500 mt-1">{variable.description}</p>}
                    </div>
                    <span
                      className={`text-xs font-medium ${variable.status === "ok" ? "text-green-600" : "text-red-600"}`}
                    >
                      {variable.status === "ok" ? "Configurada" : "No configurada"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkEnvVariables} disabled={isChecking} variant="outline" className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar variables
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
