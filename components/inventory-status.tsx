"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { fetchLowStockProducts } from "@/lib/api/products"

interface Product {
  id: string
  title: string
  inventory: number
  inventoryPercentage: number
}

export function InventoryStatus() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getInventoryData = async () => {
      try {
        setLoading(true)
        const data = await fetchLowStockProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar el inventario:", err)
        setError("No se pudo cargar la información del inventario")
        // Usar datos vacíos en caso de error
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    getInventoryData()
  }, [])

  const getStatusIcon = (percentage: number) => {
    if (percentage === 0) return <AlertCircle className="h-5 w-5 text-destructive" />
    if (percentage < 50) return <AlertTriangle className="h-5 w-5 text-warning" />
    return <CheckCircle className="h-5 w-5 text-success" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado del inventario</CardTitle>
          <CardDescription>Cargando datos de inventario...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-1/3 bg-muted rounded mb-2"></div>
                <div className="h-2 w-full bg-muted rounded"></div>
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
          <CardTitle>Estado del inventario</CardTitle>
          <CardDescription>Productos con stock bajo o agotados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">Verifica la conexión con Shopify e intenta nuevamente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado del inventario</CardTitle>
          <CardDescription>Productos con stock bajo o agotados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <CheckCircle className="h-10 w-10 text-success mb-2" />
            <p className="text-sm text-muted-foreground">No hay productos con stock bajo</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del inventario</CardTitle>
        <CardDescription>Productos con stock bajo o agotados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="space-y-2">
            <div className="flex items-center justify-between">
              {getStatusIcon(product.inventoryPercentage)}
              <span className="ml-2 flex-1">{product.title}</span>
              <span className={`${product.inventory === 0 ? "text-destructive" : "text-primary"} font-medium`}>
                {product.inventory} unidades
              </span>
            </div>
            <Progress value={product.inventoryPercentage} className="h-2" />
            <div className="text-right text-xs text-muted-foreground">{product.inventoryPercentage}%</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
