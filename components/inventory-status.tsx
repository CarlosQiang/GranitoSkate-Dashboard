"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Datos de ejemplo para cuando la API falla
const fallbackData = [
  { id: "1", title: "Tabla Skate Pro", inventory: 3, lowStockThreshold: 5 },
  { id: "2", title: "Ruedas Premium", inventory: 8, lowStockThreshold: 10 },
  { id: "3", title: "Trucks de Aluminio", inventory: 0, lowStockThreshold: 5 },
  { id: "4", title: "Rodamientos ABEC-7", inventory: 12, lowStockThreshold: 10 },
  { id: "5", title: "Grip Tape Antideslizante", inventory: 2, lowStockThreshold: 5 },
]

export function InventoryStatus() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulamos la carga de datos para evitar errores de API
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Usamos datos de ejemplo en lugar de llamar a la API
        setData(fallbackData)
      } catch (err) {
        console.error("Error loading inventory status:", err)
        setError("No se pudo cargar el estado del inventario")
        // Usar datos de respaldo en caso de error
        setData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-destructive/10 text-destructive rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No hay datos de inventario disponibles
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((product) => {
        const stockPercentage = Math.min(100, Math.round((product.inventory / product.lowStockThreshold) * 100))
        let statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />
        let statusClass = "text-green-500"

        if (product.inventory === 0) {
          statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />
          statusClass = "text-red-500"
        } else if (product.inventory < product.lowStockThreshold) {
          statusIcon = <AlertTriangle className="h-5 w-5 text-amber-500" />
          statusClass = "text-amber-500"
        }

        return (
          <div key={product.id} className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {statusIcon}
                <span className="ml-2 font-medium">{product.title}</span>
              </div>
              <span className={`font-medium ${statusClass}`}>{product.inventory} unidades</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={stockPercentage} className="h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">{stockPercentage}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
