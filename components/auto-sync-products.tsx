"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function AutoSyncProducts() {
  const { toast } = useToast()
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Función para sincronizar productos
  const syncProducts = async () => {
    try {
      const response = await fetch("/api/sync/products")
      if (!response.ok) {
        throw new Error("Error al sincronizar productos")
      }

      const data = await response.json()
      setLastSync(new Date())

      // Mostrar toast solo si hay cambios
      if (data.result && (data.result.created > 0 || data.result.updated > 0)) {
        toast({
          title: "Sincronización completada",
          description: `Se han sincronizado ${data.result.total} productos (${data.result.created} nuevos, ${data.result.updated} actualizados)`,
        })
      }
    } catch (error) {
      console.error("Error en sincronización automática:", error)
    }
  }

  useEffect(() => {
    // Sincronizar al cargar el componente
    syncProducts()

    // Configurar sincronización periódica (cada 5 minutos)
    const interval = setInterval(syncProducts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null // Este componente no renderiza nada visible
}
