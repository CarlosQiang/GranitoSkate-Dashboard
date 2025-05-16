"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AutoSyncProducts() {
  const { toast } = useToast()
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Función para sincronizar productos
  const syncProducts = async () => {
    try {
      setIsSyncing(true)
      setSyncError(null)

      console.log("Iniciando sincronización de productos...")
      const response = await fetch("/api/sync/products", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || `Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      setLastSync(new Date())

      console.log("Sincronización completada:", data)

      // Mostrar toast solo si hay cambios
      if (data.result && (data.result.created > 0 || data.result.updated > 0)) {
        toast({
          title: "Sincronización completada",
          description: `Se han sincronizado ${data.result.total} productos (${data.result.created} nuevos, ${data.result.updated} actualizados)`,
        })
      }
    } catch (error) {
      console.error("Error en sincronización automática:", error)
      setSyncError(error instanceof Error ? error.message : "Error desconocido")

      toast({
        variant: "destructive",
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : "Error al sincronizar productos",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    // Sincronizar al cargar el componente
    syncProducts()

    // Configurar sincronización periódica (cada 5 minutos)
    const interval = setInterval(syncProducts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Si hay un error, mostrar un mensaje
  if (syncError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de sincronización</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{syncError}</p>
          <Button variant="outline" size="sm" onClick={syncProducts} disabled={isSyncing} className="w-fit">
            {isSyncing ? "Sincronizando..." : "Reintentar sincronización"}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null // Este componente no renderiza nada visible si no hay errores
}
