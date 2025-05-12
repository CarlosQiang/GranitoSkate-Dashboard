"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, RefreshCw, AlertCircle } from "lucide-react"
import { fetchRecentProducts } from "@/lib/api/products"
import { formatCurrency } from "@/lib/utils"

export function RecentProducts() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchRecentProducts(5)
      setProducts(data)
    } catch (error) {
      console.error("Error loading recent products:", error)
      setError(error.message || "Error al cargar productos recientes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="mb-4 text-destructive">{error}</p>
        <Button size="sm" onClick={loadProducts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">No hay productos recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">{product.title}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(product.price, product.currencyCode)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/products/${product.id}`)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalles</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
