"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertCircle, Eye } from "lucide-react"
import { fetchRecentProducts } from "@/lib/api/products"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

export function RecentProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecentProducts(5)
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos recientes:", err)
      setError(err.message || "No se pudieron cargar los productos recientes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos recientes</CardTitle>
          <CardDescription>Los últimos productos añadidos a tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Productos recientes</span>
            <Button variant="outline" size="sm" onClick={loadProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 text-sm border rounded-md bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Productos recientes</span>
          <Button variant="outline" size="sm" onClick={loadProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </CardTitle>
        <CardDescription>Los últimos productos añadidos a tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No hay productos recientes para mostrar</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="h-12 w-12 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="font-medium hover:underline truncate block"
                  >
                    {product.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                      {product.status === "ACTIVE" ? "Activo" : "Borrador"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Stock: {product.totalInventory || 0}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(product.price, product.currencyCode)}</div>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
