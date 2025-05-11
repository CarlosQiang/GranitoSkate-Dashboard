"use client"

import { useState, useEffect } from "react"
import { fetchProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShopifyApiStatus } from "@/components/shopify-api-status"

export function ProductsList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProducts({ limit: 50 })
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(err.message || "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(term) ||
          product.vendor?.toLowerCase().includes(term) ||
          product.productType?.toLowerCase().includes(term),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  if (error) {
    return (
      <div className="space-y-4">
        <ShopifyApiStatus />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar productos</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadProducts} className="w-fit">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <ShopifyApiStatus />
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ShopifyApiStatus />

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar productos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} data-product-item />
          ))}
        </div>
      )}
    </div>
  )
}
