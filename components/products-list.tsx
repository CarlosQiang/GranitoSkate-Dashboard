"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { fetchProducts } from "@/lib/api/products"

export function ProductsList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={loadProducts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No hay productos disponibles</p>
        <Button asChild>
          <a href="/dashboard/products/new">Crear primer producto</a>
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
