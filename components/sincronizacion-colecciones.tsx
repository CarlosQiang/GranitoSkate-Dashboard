"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, FolderOpen } from "lucide-react"

export function SincronizacionColecciones() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sincronizarColecciones = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/sync/colecciones")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener colecciones")
      }

      setResultado({
        total: data.data.length,
        mensaje: data.message,
      })
    } catch (err) {
      console.error("Error al sincronizar colecciones:", err)
      setError(err.message || "Error desconocido al sincronizar colecciones")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Sincronización de Colecciones
        </CardTitle>
        <CardDescription>Obtén colecciones desde tu tienda Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resultado && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Operación completada</AlertTitle>
            <AlertDescription>
              <p>{resultado.mensaje}</p>
              <p className="mt-2">
                Total de colecciones: <strong>{resultado.total}</strong>
              </p>
            </AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Esta herramienta te permite obtener colecciones desde tu tienda Shopify. Próximamente se implementará la
          sincronización completa con la base de datos.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={sincronizarColecciones} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Obteniendo...
            </>
          ) : (
            <>
              <FolderOpen className="mr-2 h-4 w-4" />
              Obtener Colecciones desde Shopify
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
