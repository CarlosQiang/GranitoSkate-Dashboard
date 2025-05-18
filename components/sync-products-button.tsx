"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SyncProductsButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/sync/products")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sincronización completada",
          description: data.message || "Productos sincronizados correctamente",
        })
      } else {
        throw new Error(data.error || "Error al sincronizar productos")
      }
    } catch (error) {
      console.error("Error al sincronizar productos:", error)
      toast({
        variant: "destructive",
        title: "Error de sincronización",
        description: error.message || "No se pudieron sincronizar los productos. Intente nuevamente más tarde.",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={isSyncing}
      className="bg-amber-500 hover:bg-amber-600 text-white hover:text-white border-amber-500 hover:border-amber-600"
    >
      {isSyncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sincronizando...
        </>
      ) : (
        "Sincronizar"
      )}
    </Button>
  )
}
