"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Tag, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SyncPromotionsOnlyProps {
  onSyncComplete?: () => void
}

export function SyncPromotionsOnly({ onSyncComplete }: SyncPromotionsOnlyProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)

    try {
      // Primero obtener las promociones de Shopify
      console.log("🔍 Obteniendo promociones de Shopify...")
      const shopifyResponse = await fetch("/api/shopify/promotions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!shopifyResponse.ok) {
        throw new Error(`Error obteniendo promociones de Shopify: ${shopifyResponse.status}`)
      }

      const shopifyData = await shopifyResponse.json()
      console.log("📦 Promociones obtenidas:", shopifyData)

      // Luego sincronizar con la base de datos
      console.log("🔄 Sincronizando con base de datos...")
      const syncResponse = await fetch("/api/sync/promotions-replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promociones: shopifyData.promociones || [],
        }),
      })

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json()
        throw new Error(errorData.error || `Error HTTP: ${syncResponse.status}`)
      }

      const result = await syncResponse.json()
      console.log("✅ Resultado de sincronización:", result)

      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${result.results?.insertados || 0} promociones correctamente.`,
      })

      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error("❌ Error en sincronización:", error)
      toast({
        variant: "destructive",
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : "Error desconocido durante la sincronización",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Reemplazo Completo de Promociones</CardTitle>
        </div>
        <CardDescription>
          Borra TODAS las promociones existentes y las reemplaza con los datos actuales de Shopify
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">¡Atención!</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Esta acción borrará TODAS las promociones existentes en la base de datos y las reemplazará con los
                  datos actuales de Shopify.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isLoading ? "Procesando..." : "Borrar y Reemplazar Promociones"}
        </Button>
      </CardContent>
    </Card>
  )
}
