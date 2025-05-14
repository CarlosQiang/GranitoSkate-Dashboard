"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface AutoSyncProps {
  interval?: number // Intervalo en milisegundos
}

export default function AutoSync({ interval = 3600000 }: AutoSyncProps) {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar si hay una sincronización pendiente
    const checkAndSync = async () => {
      try {
        // Obtener la última sincronización
        const response = await fetch("/api/db/registro?limit=1")
        if (response.ok) {
          const data = await response.json()

          const shouldSync = shouldSyncNow(data.registros)

          if (shouldSync) {
            // Iniciar sincronización
            await startSync()
          }
        }
      } catch (error) {
        console.error("Error al verificar sincronización:", error)
      }
    }

    // Verificar si se debe sincronizar ahora
    const shouldSyncNow = (registros: any[]): boolean => {
      if (!registros || registros.length === 0) {
        // No hay registros, se debe sincronizar
        return true
      }

      const lastSyncRecord = registros[0]
      const lastSyncDate = new Date(lastSyncRecord.fecha)
      setLastSync(lastSyncDate)

      // Calcular tiempo transcurrido desde la última sincronización
      const now = new Date()
      const timeSinceLastSync = now.getTime() - lastSyncDate.getTime()

      // Sincronizar si ha pasado el intervalo definido
      return timeSinceLastSync >= interval
    }

    // Iniciar sincronización
    const startSync = async () => {
      try {
        const response = await fetch("/api/sync")
        const data = await response.json()

        if (data.success) {
          setLastSync(new Date())
          toast({
            title: "Sincronización automática completada",
            description: "Los datos se han sincronizado correctamente.",
            variant: "default",
          })
        } else {
          toast({
            title: "Error en sincronización automática",
            description: data.message || "Error al sincronizar datos",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error en sincronización automática:", error)
        toast({
          title: "Error en sincronización automática",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      }
    }

    // Ejecutar verificación al cargar el componente
    checkAndSync()

    // Configurar intervalo para verificar periódicamente
    const intervalId = setInterval(checkAndSync, interval)

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId)
  }, [interval, toast])

  return null // Componente invisible
}
