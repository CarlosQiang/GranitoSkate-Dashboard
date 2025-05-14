"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Obtener la última sincronización al cargar el componente
    fetchLastSync()
  }, [])

  const fetchLastSync = async () => {
    try {
      const response = await fetch("/api/db/registro?limit=1")
      if (response.ok) {
        const data = await response.json()
        if (data.registros && data.registros.length > 0) {
          const registro = data.registros[0]
          setLastSync(new Date(registro.fecha).toLocaleString())
        }
      }
    } catch (error) {
      console.error("Error al obtener el último registro de sincronización:", error)
    }
  }

  const startSync = async () => {
    setIsSyncing(true)
    setError(null)
    setSyncResult(null)

    try {
      // Verificar la conexión a la base de datos antes de sincronizar
      const connectionCheck = await fetch("/api/db/check-connection")
      if (!connectionCheck.ok) {
        const errorData = await connectionCheck.json()
        throw new Error(`Error de conexión a la base de datos: ${errorData.message || "Error desconocido"}`)
      }

      const response = await fetch("/api/sync")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error en la sincronización")
      }

      setSyncResult(data)
      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado los datos con éxito.`,
        variant: "default",
      })

      // Actualizar la última sincronización
      fetchLastSync()
    } catch (error) {
      console.error("Error en sincronización:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      toast({
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sincronización con Shopify</CardTitle>
        <CardDescription>
          Sincroniza productos, colecciones, clientes, pedidos y promociones desde Shopify a la base de datos local.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lastSync && <div className="mb-4 text-sm text-muted-foreground">Última sincronización: {lastSync}</div>}

        {isSyncing && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              <span>Sincronizando datos...</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {syncResult && syncResult.success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Sincronización completada</AlertTitle>
            <AlertDescription className="text-green-700">
              <div className="mt-2">
                <p>Datos sincronizados:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Productos: {syncResult.details?.productos || 0} nuevos</li>
                  <li>Colecciones: {syncResult.details?.colecciones || 0} nuevas</li>
                  <li>Promociones: {syncResult.details?.promociones || 0} nuevas</li>
                  <li>Clientes: {syncResult.details?.clientes || 0} nuevos</li>
                  <li>Pedidos: {syncResult.details?.pedidos || 0} nuevos</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={startSync} disabled={isSyncing} className="w-full">
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar con Shopify
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
