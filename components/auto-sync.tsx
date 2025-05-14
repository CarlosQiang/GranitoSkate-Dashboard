"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function AutoSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAndSync = async () => {
      try {
        // Verificar si hay datos en la base de datos
        const response = await fetch("/api/db/check")
        const data = await response.json()

        if (data.isEmpty) {
          // Si la base de datos está vacía, iniciar sincronización
          setIsSyncing(true)
          toast({
            title: "Sincronización automática",
            description: "Iniciando sincronización automática de datos...",
            duration: 5000,
          })

          // Iniciar sincronización
          const syncResponse = await fetch("/api/sync")
          const syncData = await syncResponse.json()

          if (syncData.success) {
            toast({
              title: "Sincronización completada",
              description: "Los datos se han sincronizado correctamente",
              duration: 5000,
            })
          } else {
            toast({
              title: "Error en la sincronización",
              description: syncData.message || "Ha ocurrido un error durante la sincronización",
              variant: "destructive",
              duration: 5000,
            })
          }
        }
      } catch (error) {
        console.error("Error al verificar o sincronizar datos:", error)
        toast({
          title: "Error",
          description: "Ha ocurrido un error al verificar o sincronizar los datos",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsSyncing(false)
      }
    }

    // Ejecutar verificación y sincronización
    checkAndSync()
  }, [toast])

  return null // Este componente no renderiza nada
}
