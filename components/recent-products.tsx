"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, RefreshCw, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchRecentProducts } from "@/lib/api/products"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRecentProducts(5)
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos recientes:", err)
      setError((err as Error).message || "Error desconocido al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Productos recientes</CardTitle>
        <Button variant="ghost" size="sm" onClick={loadProducts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando productos...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-md">
            <p className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
            <Button variant="outline" size="sm" onClick={loadProducts} className="mt-2 w-full sm:w-auto">
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No hay productos recientes</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="hover:bg-primary/10 hover:text-primary p-1 sm:p-2 flex-shrink-0"
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
