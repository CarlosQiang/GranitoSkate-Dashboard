"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Gift, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SyncPromotionsDashboardProps {
  onSyncComplete?: () => void
}

export function SyncPromotionsDashboard({ onSyncComplete }: SyncPromotionsDashboardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<{
    success: boolean
    insertados: number
    errores: number
    timestamp: Date
  } | null>(null)

  const handleSync = async () => {
    setIsLoading(true)

    try {
      console.log("🔄 Iniciando sincronización de promociones desde dashboard...")

      const response = await fetch("/api/sync/promotions-replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Resultado de sincronización:", result)

      setLastSync({
        success: true,
        insertados: result.insertados || 0,
        errores: result.errores || 0,
        timestamp: new Date(),
      })

      toast({
        title: "Sincronización exitosa",
        description: `Se sincronizaron ${result.insertados || 0} promociones correctamente.`,
      })

      onSyncComplete?.()
    } catch (error) {
      console.error("❌ Error en sincronización:", error)

      setLastSync({
        success: false,
        insertados: 0,
        errores: 1,
        timestamp: new Date(),
      })

      toast({
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Sincronización de Promociones
        </CardTitle>
        <CardDescription>Sincroniza las promociones desde Shopify al dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando..." : "Sincronizar Promociones"}
        </Button>

        {lastSync && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {lastSync.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {lastSync.success ? "Última sincronización exitosa" : "Error en última sincronización"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Promociones sincronizadas: {lastSync.insertados}</div>
              {lastSync.errores > 0 && <div className="text-red-600">Errores: {lastSync.errores}</div>}
              <div>Fecha: {lastSync.timestamp.toLocaleString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
