"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SyncPromotionsOnlyProps {
  onSyncComplete?: () => void
}

export function SyncPromotionsOnly({ onSyncComplete }: SyncPromotionsOnlyProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    setProgress(0)
    setStatus("Iniciando sincronización de promociones...")
    setError(null)
    setSuccess(false)

    try {
      // Paso 1: Obtener promociones de Shopify
      setProgress(10)
      setStatus("Obteniendo promociones desde Shopify...")

      const shopifyResponse = await fetch("/api/shopify/promotions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!shopifyResponse.ok) {
        throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
      }

      const shopifyData = await shopifyResponse.json()
      setProgress(40)
      setStatus(`Se encontraron ${shopifyData.length} promociones en Shopify...`)

      // Paso 2: Sincronizar con la base de datos local (reemplazar estrategia)
      setProgress(60)
      setStatus("Sincronizando promociones con la base de datos local...")

      const syncResponse = await fetch("/api/sync/promotions-replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promociones: shopifyData }),
      })

      if (!syncResponse.ok) {
        throw new Error(`Error al sincronizar promociones: ${syncResponse.status}`)
      }

      const syncResult = await syncResponse.json()

      setProgress(100)
      setStatus(`Sincronización completada. ${syncResult.count || 0} promociones sincronizadas.`)
      setSuccess(true)

      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${syncResult.count || 0} promociones correctamente.`,
      })

      // Llamar al callback si existe
      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (err) {
      console.error("Error en la sincronización:", err)
      setError(err instanceof Error ? err.message : "Error desconocido durante la sincronización")

      toast({
        variant: "destructive",
        title: "Error de sincronización",
        description: err instanceof Error ? err.message : "Error desconocido durante la sincronización",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sincronización de Promociones</CardTitle>
        <CardDescription>Sincroniza las promociones desde Shopify a la base de datos local</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && !isLoading && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">{status}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando..." : "Sincronizar Promociones"}
        </Button>
      </CardFooter>
    </Card>
  )
}
