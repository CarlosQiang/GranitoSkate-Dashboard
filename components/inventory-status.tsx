"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { fetchLowStockProducts } from "@/lib/api/products"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
        const lowStockProducts = await fetchLowStockProducts()
        setProducts(lowStockProducts)
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
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-destructive/10 text-destructive rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        <p>No hay productos con stock bajo</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const stockPercentage = Math.min(100, (product.inventoryQuantity / product.lowStockThreshold) * 100)
        const isOutOfStock = product.inventoryQuantity === 0

        return (
          <Link
            href={`/dashboard/products/${product.id}`}
            key={product.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
              {product.featuredImage ? (
                <img
                  src={product.featuredImage.url || "/placeholder.svg"}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                  No img
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{product.title}</h4>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="ml-2">
                    Agotado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Stock bajo
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Progress value={stockPercentage} className="h-2" />
                <span className="text-xs font-medium">
                  {product.inventoryQuantity}/{product.lowStockThreshold}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">SKU: {product.sku || "N/A"}</p>
            </div>

            {isOutOfStock && <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />}
          </Link>
        )
      })}
    </div>
  )
}
