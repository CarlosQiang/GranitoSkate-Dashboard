"use client"

import { useState, useEffect } from "react"
import { fetchProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ProductsList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProducts({ limit: 50 })

        // Verificar que los datos sean válidos
        if (!Array.isArray(data)) {
          throw new Error("Los datos recibidos no son un array válido")
        }

        // Asegurarse de que cada producto tenga un ID
        const validProducts = data.filter((product) => product && product.id)

        setProducts(validProducts)
        setFilteredProducts(validProducts)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError(err.message || "Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    let result = [...products]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productType?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por estado
    if (filter !== "all") {
      result = result.filter((product) => product.status === filter)
    }

    setFilteredProducts(result)
  }, [searchTerm, filter, products])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Cargando productos...</div>
  }

  if (products.length === 0) {
    return <div className="text-center py-8">No se encontraron productos.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:max-w-xs">
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
        <div className="text-center py-8">No se encontraron productos con los filtros aplicados.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
