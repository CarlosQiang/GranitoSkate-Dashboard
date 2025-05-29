"use client"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, AlertTriangle, CheckCircle2, Package } from "lucide-react"

interface InventoryStatusProps {
  data?: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
}

export function InventoryStatus({ data }: InventoryStatusProps) {
  if (!data || typeof data !== "object") {
    // Mostrar datos de ejemplo si no hay datos reales
    const exampleData = {
      inStock: 8,
      lowStock: 2,
      outOfStock: 0,
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{exampleData.inStock}</div>
            <p className="text-xs text-muted-foreground">En stock</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{exampleData.lowStock}</div>
            <p className="text-xs text-muted-foreground">Stock bajo</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{exampleData.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Agotado</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Estado general del inventario</span>
            <span>
              {Math.round(
                (exampleData.inStock / (exampleData.inStock + exampleData.lowStock + exampleData.outOfStock)) * 100,
              )}
              %
            </span>
          </div>
          <Progress
            value={Math.round(
              (exampleData.inStock / (exampleData.inStock + exampleData.lowStock + exampleData.outOfStock)) * 100,
            )}
            className="h-2"
          />
        </div>
      </div>
    )
  }

  const { inStock = 0, lowStock = 0, outOfStock = 0 } = data
  const total = inStock + lowStock + outOfStock

  if (total === 0) {
    return (
      <div className="text-center py-6">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">No hay productos en el inventario</p>
      </div>
    )
  }

  const healthPercentage = Math.round((inStock / total) * 100)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{inStock}</div>
          <p className="text-xs text-muted-foreground">En stock</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{lowStock}</div>
          <p className="text-xs text-muted-foreground">Stock bajo</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
          <p className="text-xs text-muted-foreground">Agotado</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Estado general del inventario</span>
          <span>{healthPercentage}%</span>
        </div>
        <Progress value={healthPercentage} className="h-2" />
      </div>
    </div>
  )
}
