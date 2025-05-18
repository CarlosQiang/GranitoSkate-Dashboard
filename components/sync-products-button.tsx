"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function SyncProductsButton() {
  const [loading, setLoading] = useState(false)

  const syncProducts = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/sync/products")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar productos")
      }

      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${data.count} productos.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error al sincronizar productos:", error)
      toast({
        title: "Error al sincronizar",
        description: error instanceof Error ? error.message : "Error desconocido al sincronizar productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={syncProducts} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
