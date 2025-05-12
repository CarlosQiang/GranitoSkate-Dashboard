"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { fetchRecentProducts } from "@/lib/api/products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await fetchRecentProducts(5)
        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar productos recientes:", err)
        setError("Error al cargar productos recientes")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos recientes</CardTitle>
        <CardDescription>Los últimos productos añadidos</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
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
          <p className="text-center text-muted-foreground py-4">No hay productos recientes</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div>
                  <Link href={`/dashboard/products/${product.id}`} className="font-medium hover:underline">
                    {product.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.status === "ACTIVE" ? "Activo" : "Borrador"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
