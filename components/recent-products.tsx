"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { fetchRecentProducts } from "@/lib/api/products"

export function RecentProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRecentProducts()
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos recientes:", err)
      setError("No se pudieron cargar los productos recientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold">Productos recientes</CardTitle>
          <CardDescription>Los últimos 5 productos añadidos a tu tienda</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={loadProducts} disabled={loading} aria-label="Actualizar productos">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando productos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadProducts}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay productos recientes</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear producto
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
