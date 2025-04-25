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
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-granito to-granito-light text-white">
        <div>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Productos recientes
          </CardTitle>
          <CardDescription className="text-white/80">Los últimos 5 productos añadidos a tu tienda</CardDescription>
        </div>
        {!isLoading && (
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchProducts}
            disabled={isLoading}
            className="bg-white text-granito hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
            <p className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
            <Button variant="outline" size="sm" onClick={fetchProducts} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No hay productos recientes</p>
            <Button variant="outline" size="sm" onClick={fetchProducts} className="mt-4">
              Actualizar datos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
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
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{product.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={product.status === "ACTIVE" ? "default" : "secondary"}
                      className={product.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                    >
                      {product.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Stock: {product.totalInventory}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="hover:bg-granito/10 hover:text-granito">
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Eye className="h-4 w-4" />
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
