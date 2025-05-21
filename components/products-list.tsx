"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Package, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductCard from "./product-card"

export default function ProductsList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
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

  const fetchProducts = async (useCache = true) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/cached/products?transform=true${!useCache ? "&refresh=true" : ""}`)
      const data = await response.json()
      setProducts(data.data || [])
      setFilteredProducts(data.data || [])
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

  if (products.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-muted-foreground mb-4">No hay productos disponibles</p>
        <Button onClick={() => fetchProducts(false)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
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
        <Button onClick={() => fetchProducts(false)} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
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
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.shopify_id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
