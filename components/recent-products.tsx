"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentProducts } from "@/lib/api/products"
import { Package, RefreshCw, AlertCircle, Eye } from "lucide-react"

interface Product {
  id: string
  title: string
  handle: string
  status: string
  totalInventory: number
  featuredImage: {
    url: string
  } | null
}

export function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecentProducts(5)
      setProducts(data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError((err as Error).message || "Error desconocido al cargar productos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <Card className="border-granito/20 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-granito to-granito-light text-white p-3 sm:p-4">
        <div>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Package className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Productos recientes
          </CardTitle>
          <CardDescription className="text-white/80 text-xs sm:text-sm">
            Los últimos 5 productos añadidos a tu tienda
          </CardDescription>
        </div>
        {!isLoading && (
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchProducts}
            disabled={isLoading}
            className="bg-white text-granito hover:bg-gray-100 mt-2 sm:mt-0 w-full sm:w-auto"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Actualizar
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-md" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                  <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
                </div>
                <Skeleton className="h-6 sm:h-8 w-6 sm:w-8 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-md">
            <p className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
            <Button variant="outline" size="sm" onClick={fetchProducts} className="mt-2 w-full sm:w-auto">
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <Package className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground text-sm">No hay productos recientes</p>
            <Button variant="outline" size="sm" onClick={fetchProducts} className="mt-4">
              Actualizar datos
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url || "/placeholder.svg"}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{product.title}</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                    <Badge
                      variant={product.status === "ACTIVE" ? "default" : "secondary"}
                      className={`text-xs ${
                        product.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                      }`}
                    >
                      {product.status}
                    </Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">Stock: {product.totalInventory}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-granito/10 hover:text-granito p-1 sm:p-2 flex-shrink-0"
                >
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
