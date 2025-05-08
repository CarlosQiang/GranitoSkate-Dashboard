"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addProductsToCollection, removeProductsFromCollection } from "@/lib/api/collections"
import { toast } from "@/components/ui/use-toast"

interface CollectionProductManagerProps {
  collectionId: string
  products: any[]
  collectionProducts: any[]
}

export function CollectionProductManager({
  collectionId,
  products,
  collectionProducts,
}: CollectionProductManagerProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Selecciona productos",
        description: "Debes seleccionar al menos un producto para añadir a la colección.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await addProductsToCollection(collectionId, selectedProducts)
      toast({
        title: "Productos añadidos",
        description: `${selectedProducts.length} productos añadidos a la colección.`,
      })
      setSelectedProducts([])
    } catch (error) {
      console.error("Error adding products to collection:", error)
      toast({
        title: "Error",
        description: "No se pudieron añadir los productos a la colección.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    try {
      setLoading(true)
      await removeProductsFromCollection(collectionId, [productId])
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado de la colección.",
      })
    } catch (error) {
      console.error("Error removing product from collection:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto de la colección.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Productos en la colección</CardTitle>
        </CardHeader>
        <CardContent>
          {collectionProducts.length === 0 ? (
            <p className="text-muted-foreground">Esta colección no tiene productos.</p>
          ) : (
            <div className="space-y-4">
              {collectionProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img
                        src={product.image.url || "/placeholder.svg"}
                        alt={product.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.productType}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveProduct(product.id)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Añadir productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-muted-foreground">No hay productos disponibles para añadir.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                        />
                        {product.image && (
                          <img
                            src={product.image.url || "/placeholder.svg"}
                            alt={product.title}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <label htmlFor={`product-${product.id}`} className="font-medium cursor-pointer">
                            {product.title}
                          </label>
                          <p className="text-sm text-muted-foreground">{product.productType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddProducts}
                    disabled={loading || selectedProducts.length === 0}
                    className="bg-brand hover:bg-brand-dark"
                  >
                    {loading ? "Añadiendo..." : "Añadir seleccionados"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
