"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface SyncPromotionsOnlyProps {
  onSyncComplete?: () => void
  isLoading?: boolean
}

export function SyncPromotionsOnly({ onSyncComplete, isLoading = false }: SyncPromotionsOnlyProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/sync/promotions-replace", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al sincronizar promociones")
      }

      const data = await response.json()
      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${data.count || 0} promociones correctamente.`,
      })

      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error("Error al sincronizar promociones:", error)
      toast({
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al sincronizar las promociones",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincronización de promociones</CardTitle>
        <CardDescription>
          Sincroniza las promociones y descuentos desde Shopify a la base de datos local
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Esta acción actualizará todas las promociones en la base de datos local con la información más reciente de
          Shopify. Las promociones existentes se actualizarán y se añadirán las nuevas.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={isSyncing || isLoading} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing || isLoading ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : isLoading ? "Actualizando..." : "Sincronizar promociones"}
        </Button>
      </CardFooter>
    </Card>
  )
}
