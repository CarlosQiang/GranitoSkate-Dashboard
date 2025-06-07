"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReemplazoCompletoPromocionesProps {
  onSyncComplete?: () => void
}

export function ReemplazoCompletoPromociones({ onSyncComplete }: ReemplazoCompletoPromocionesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleReplace = async () => {
    setIsLoading(true)

    try {
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

      toast({
        title: "Reemplazo completado",
        description: `Se han sincronizado ${result.results?.insertados || 0} promociones correctamente.`,
      })

      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error("Error en el reemplazo:", error)
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
          <Users className="h-5 w-5 text-muted-foreground" />
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
          onClick={handleReplace}
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
