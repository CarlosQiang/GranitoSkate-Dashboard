"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentProducts } from "@/lib/api/products"
import { Package } from "lucide-react"
import { ErrorHandler } from "@/components/error-handler"

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
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecentProducts(5)
      setProducts(data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar productos"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (error) {
    return <ErrorHandler error={error} resetError={fetchProducts} message="Error al cargar los productos recientes" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos recientes</CardTitle>
          <CardDescription>Los últimos 5 productos añadidos a tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos recientes</CardTitle>
        <CardDescription>Los últimos 5 productos añadidos a tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No hay productos recientes</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
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
                    <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>{product.status}</Badge>
                    <p className="text-sm text-muted-foreground">Stock: {product.totalInventory}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/products/${product.id}`}>Ver</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
