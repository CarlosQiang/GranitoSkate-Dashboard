"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { fetchLowStockProducts } from "@/lib/api/products"
import Link from "next/link"

export function InventoryStatus() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Obtener datos reales de la API
        const data = await fetchLowStockProducts()
        setProducts(data)
      } catch (err) {
        console.error("Error loading inventory status:", err)
        setError("No se pudo cargar el estado del inventario")
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
      <div className="flex items-center justify-center h-[200px] bg-destructive/10 text-destructive rounded-md p-4">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-green-100 text-green-800 rounded-md p-4">
        <CheckCircle className="h-5 w-5 mr-2" />
        <p>Todos los productos tienen stock suficiente</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const stockPercentage = Math.min(100, Math.round((product.inventoryQuantity / product.lowStockThreshold) * 100))
        let statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />
        let statusClass = "text-green-500"

        if (product.inventoryQuantity === 0) {
          statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />
          statusClass = "text-red-500"
        } else if (product.inventoryQuantity < product.lowStockThreshold) {
          statusIcon = <AlertTriangle className="h-5 w-5 text-amber-500" />
          statusClass = "text-amber-500"
        }

        return (
          <Link
            href={`/dashboard/products/${product.id}`}
            key={product.id}
            className="flex flex-col space-y-2 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {statusIcon}
                <span className="ml-2 font-medium">{product.title}</span>
              </div>
              <span className={`font-medium ${statusClass}`}>{product.inventoryQuantity} unidades</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={stockPercentage} className="h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">{stockPercentage}%</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
