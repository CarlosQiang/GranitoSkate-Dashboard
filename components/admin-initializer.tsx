// Componente para inicializar el usuario admin desde la UI
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, User, RefreshCw } from "lucide-react"

export default function AdminInitializer() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    admin?: any
  } | null>(null)

  const initializeAdmin = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/init-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión al inicializar administrador",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Inicializar Administrador
        </CardTitle>
        <CardDescription>Crear o actualizar el usuario administrador por defecto</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Usuario:</strong> admin
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Email:</strong> admin@gmail.com
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Contraseña:</strong> GranitoSkate
          </p>
        </div>

        <Button onClick={initializeAdmin} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Inicializando...
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Crear/Actualizar Admin
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
              </AlertDescription>
            </div>

            {result.success && result.admin && (
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>ID:</strong> {result.admin.id}
                </p>
                <p>
                  <strong>Usuario:</strong> {result.admin.nombre_usuario}
                </p>
                <p>
                  <strong>Email:</strong> {result.admin.correo_electronico}
                </p>
              </div>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
