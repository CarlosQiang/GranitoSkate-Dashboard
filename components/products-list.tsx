"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (!products.length) return

    let filtered = [...products]

    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter)
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.title?.toLowerCase().includes(term) ||
          product.vendor?.toLowerCase().includes(term) ||
          product.product_type?.toLowerCase().includes(term),
      )
    }

    setFilteredProducts(filtered)
  }, [products, statusFilter, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      // Intentar obtener productos de la caché
      const response = await fetch("/api/cached/products?transform=true")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setProducts(data.data || [])
        setFilteredProducts(data.data || [])
      } else {
        throw new Error(data.error || "Error desconocido al obtener productos")
      }
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchProducts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="DRAFT">Borradores</SelectItem>
            <SelectItem value="ARCHIVED">Archivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No hay productos disponibles</h3>
          <p className="text-muted-foreground mt-1">
            {products.length > 0
              ? "No se encontraron productos que coincidan con los filtros"
              : "No hay productos disponibles"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.shopify_id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-slate-100 relative">
                {product.featured_image ? (
                  <img
                    src={product.featured_image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={
                    product.status === "ACTIVE" ? "default" : product.status === "DRAFT" ? "secondary" : "outline"
                  }
                >
                  {product.status === "ACTIVE" ? "Activo" : product.status === "DRAFT" ? "Borrador" : "Archivado"}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate">{product.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="font-bold">${Number.parseFloat(product.price || 0).toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ${Number.parseFloat(product.compare_at_price || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Stock: {product.inventory_quantity || 0}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
