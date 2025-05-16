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
  const [showError, setShowError] = useState(true)

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

      // Si es un error de autenticación de Shopify, mostrar un mensaje más amigable
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      const isShopifyAuthError = errorMessage.includes("401") && errorMessage.includes("Shopify")

      setSyncError(
        isShopifyAuthError
          ? "Error de autenticación con Shopify. El token de acceso puede ser inválido o haber expirado."
          : errorMessage,
      )

      // No mostrar toast para errores de autenticación de Shopify, ya que es un error esperado
      if (!isShopifyAuthError) {
        toast({
          variant: "destructive",
          title: "Error de sincronización",
          description: "Error al sincronizar productos. Consulta los detalles en la consola.",
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    // Sincronizar al cargar el componente
    syncProducts()

    // Configurar sincronización periódica (cada 15 minutos en lugar de 5)
    const interval = setInterval(syncProducts, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Si hay un error, mostrar un mensaje que se puede ocultar
  if (syncError && showError) {
    return (
      <Alert variant="destructive" className="mt-4 relative">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de sincronización</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{syncError}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={syncProducts} disabled={isSyncing} className="w-fit">
              {isSyncing ? "Sincronizando..." : "Reintentar sincronización"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowError(false)} className="w-fit">
              Ignorar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null // Este componente no renderiza nada visible si no hay errores o si se ha ocultado
}
