"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchLowStockProducts } from "@/lib/api/products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InventoryStatus() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await fetchLowStockProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar productos con stock bajo:", err)
        setError("Error al cargar el inventario")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const getStockIcon = (quantity: number, inventoryPolicy: string) => {
    if (inventoryPolicy === "DENY" && quantity <= 0) {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    } else if (quantity <= 5) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    } else {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
  }

  const getStockPercentage = (quantity: number, initialQuantity = 20) => {
    if (quantity <= 0) return 0
    const percentage = (quantity / initialQuantity) * 100
    return Math.min(percentage, 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del inventario</CardTitle>
        <CardDescription>Productos con stock bajo o agotados</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-5 w-[60px]" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No hay productos con stock bajo</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStockIcon(product.quantity, product.inventoryPolicy)}
                    <Link href={`/dashboard/products/${product.id}`} className="font-medium hover:underline">
                      {product.title}
                    </Link>
                  </div>
                  <span
                    className={`${product.quantity <= 0 ? "text-red-500" : product.quantity <= 5 ? "text-amber-500" : "text-green-500"}`}
                  >
                    {product.quantity} unidades
                  </span>
                </div>
                <Progress value={getStockPercentage(product.quantity)} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
