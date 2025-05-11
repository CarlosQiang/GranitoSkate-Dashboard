"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentProducts } from "@/lib/api/products"
import { formatDate, formatCurrency, getImageUrl } from "@/lib/utils"
import { Package, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRecentProducts(5)
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos recientes:", err)
      setError(err.message || "No se pudieron cargar los productos recientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 border-b pb-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="ml-auto h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={loadProducts}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay productos recientes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Productos recientes</CardTitle>
        <Button variant="outline" size="sm" onClick={loadProducts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-4 border-b pb-4 last:border-0 last:pb-0">
              <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                {product.image ? (
                  <Image
                    src={getImageUrl(product.image.url) || "/placeholder.svg"}
                    alt={product.image.altText || product.title}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="font-medium truncate">{product.title}</p>
                <p className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</p>
              </div>
              <div className="font-medium">{formatCurrency(product.price.amount, product.price.currencyCode)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/products">Ver todos los productos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Exportación por defecto para compatibilidad
export default RecentProducts
