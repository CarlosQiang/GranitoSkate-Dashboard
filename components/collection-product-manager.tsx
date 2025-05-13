"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface CollectionProductManagerProps {
  productId?: string
  collectionId?: string
  onComplete?: () => void
  mode: "add" | "remove"
}

export function CollectionProductManager({ productId, collectionId, onComplete, mode }: CollectionProductManagerProps) {
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  useEffect(() => {
    // Simula la carga de productos desde una API
    const loadProducts = async () => {
      // Aquí deberías hacer una llamada a tu API para obtener los productos
      // y filtrarlos según el productId y collectionId
      const mockProducts = [
        { id: "1", title: "Producto 1" },
        { id: "2", title: "Producto 2" },
        { id: "3", title: "Producto 3" },
        { id: "4", title: "Producto 4" },
        { id: "5", title: "Producto 5" },
      ]
      setProducts(mockProducts)
    }

    loadProducts()
  }, [productId, collectionId])

  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleCompleteAction = () => {
    // Simula la acción de añadir o eliminar productos
    console.log(`Simulando ${mode} productos:`, selectedProducts)
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4 space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleProductSelection(product.id)}
                  />
                  <label
                    htmlFor={`product-${product.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {product.title}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleCompleteAction} disabled={selectedProducts.length === 0}>
          {mode === "add" ? "Añadir productos" : "Eliminar productos"}
        </Button>
      </div>
    </div>
  )
}
