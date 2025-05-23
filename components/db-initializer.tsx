"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, Database } from "lucide-react"

export function DbInitializer() {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const initializeDb = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/db/init")
      const data = await response.json()

      if (data.status === "error") {
        throw new Error(data.message || "Error al inicializar la base de datos")
      }

      setResult(data)
      setInitialized(true)
    } catch (err: any) {
      console.error("Error al inicializar la base de datos:", err)
      setError(err.message || "Error desconocido al inicializar la base de datos")
    } finally {
      setLoading(false)
    }
  }

  // Verificar estado de inicialización al cargar
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db/check")
        const data = await response.json()
        setInitialized(data.success)
      } catch (err) {
        console.error("Error al verificar estado de la base de datos:", err)
      }
    }

    checkDbStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Inicialización de Base de Datos
        </CardTitle>
        <CardDescription>Crea las tablas necesarias para el funcionamiento de la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {initialized && !error && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Base de datos inicializada</AlertTitle>
            <AlertDescription>
              {result?.message || "La base de datos ha sido inicializada correctamente."}
              {result?.adminCreated && (
                <p className="mt-2">Se ha creado el usuario administrador con las credenciales por defecto.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Esta herramienta crea las tablas necesarias para el funcionamiento de la aplicación. Si es la primera vez que
          utilizas la aplicación, debes inicializar la base de datos.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDb} disabled={loading || initialized} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Inicializando...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              {initialized ? "Base de datos ya inicializada" : "Inicializar Base de Datos"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
