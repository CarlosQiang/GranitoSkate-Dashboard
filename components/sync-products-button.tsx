"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SyncProductsButton() {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/sync/products", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sincronización completada",
          description: data.message,
        })
        // Recargar la página para mostrar los productos actualizados
        window.location.reload()
      } else {
        toast({
          title: "Error de sincronización",
          description: data.error || "No se pudieron sincronizar los productos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al sincronizar productos:", error)
      toast({
        title: "Error de sincronización",
        description: "Ocurrió un error al sincronizar los productos",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={syncing} className="bg-[#c59d45] hover:bg-[#b08a3a] text-white">
      {syncing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Sincronizando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sincronizar
        </>
      )}
    </Button>
  )
}
