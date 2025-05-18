"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function InitAdmin() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminInfo, setAdminInfo] = useState<any>(null)

  const initializeAdmin = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/db/init-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al inicializar administrador")
      }

      setSuccess(true)
      setAdminInfo(data.admin)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicializar Administrador</CardTitle>
        <CardDescription>Crea un usuario administrador por defecto si no existe ninguno en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Éxito</AlertTitle>
            <AlertDescription className="text-green-700">
              {adminInfo ? "Ya existe un administrador en el sistema" : "Administrador creado correctamente"}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {adminInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Información del administrador:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                <span className="font-medium">Usuario:</span> {adminInfo.nombre_usuario}
              </li>
              <li>
                <span className="font-medium">Email:</span> {adminInfo.correo_electronico}
              </li>
              <li>
                <span className="font-medium">Nombre:</span> {adminInfo.nombre_completo}
              </li>
              <li>
                <span className="font-medium">Rol:</span> {adminInfo.rol}
              </li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={initializeAdmin} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inicializando...
            </>
          ) : (
            "Inicializar Administrador"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
