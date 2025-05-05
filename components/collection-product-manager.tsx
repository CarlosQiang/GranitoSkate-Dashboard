"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Package } from "lucide-react"
import { fetchProducts } from "@/lib/api/products"
import { addProductsToCollection, removeProductsFromCollection } from "@/lib/api/collections"
import Image from "next/image"

interface CollectionProductManagerProps {
  collectionId: string
  onComplete: () => void
  mode: "add" | "remove"
}

export function CollectionProductManager({ collectionId, onComplete, mode }: CollectionProductManagerProps) {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)
        const productsData = await fetchProducts(50) // Cargar más productos para tener una buena selección
        setProducts(productsData)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError("No se pudieron cargar los productos. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter((product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      if (mode === "add") {
        await addProductsToCollection(collectionId, selectedProducts)
      } else {
        await removeProductsFromCollection(collectionId, selectedProducts)
      }

      onComplete()
    } catch (err) {
      console.error(`Error al ${mode === "add" ? "añadir" : "eliminar"} productos:`, err)

      // Mensaje de error más detallado
      let errorMessage = `No se pudieron ${mode === "add" ? "añadir" : "eliminar"} los productos a la colección.`

      // Si hay un mensaje de error específico de la API, lo mostramos
      if (err.response?.errors && err.response.errors.length > 0) {
        errorMessage += ` Error: ${err.response.errors[0].message}`
      } else if (err.message) {
        errorMessage += ` Error: ${err.message}`
      }

      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
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
        <Button onClick={handleSubmit} disabled={selectedProducts.length === 0 || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "add" ? "Añadiendo..." : "Eliminando..."}
            </>
          ) : (
            <>
              {mode === "add" ? "Añadir" : "Eliminar"} {selectedProducts.length}{" "}
              {selectedProducts.length === 1 ? "producto" : "productos"}
            </>
          )}
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`overflow-hidden cursor-pointer transition-all ${
                selectedProducts.includes(product.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleToggleProduct(product.id)}
            >
              <div className="aspect-square relative">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Checkbox checked={selectedProducts.includes(product.id)} />
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium truncate">{product.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium">{product.price} €</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status === "ACTIVE" ? "Visible" : "Oculto"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
