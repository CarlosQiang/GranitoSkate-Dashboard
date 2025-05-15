"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { fetchProducts } from "@/lib/api/products"
import {
  fetchCollectionProducts,
  addProductToCollection,
  removeProductFromCollection,
  fetchProductsNotInCollection,
} from "@/lib/api/collections"
import { Loader2, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface CollectionProductManagerProps {
  productId?: string
  collectionId?: string
  onComplete?: () => void
  mode: "add" | "remove"
}

export function CollectionProductManager({ productId, collectionId, onComplete, mode }: CollectionProductManagerProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [collectionProducts, setCollectionProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // Ensure we have a clean ID (remove any Shopify prefixes)
        const cleanCollectionId = collectionId
          ? collectionId.includes("/")
            ? collectionId
            : `gid://shopify/Collection/${collectionId}`
          : undefined

        const cleanProductId = productId
          ? productId.includes("/")
            ? productId
            : `gid://shopify/Product/${productId}`
          : undefined

        // If we're in "add" mode, we need products not in the collection
        if (mode === "add" && cleanCollectionId) {
          const productsNotInCollection = await fetchProductsNotInCollection(cleanCollectionId)
          setProducts(productsNotInCollection.edges?.map((edge) => edge.node) || [])
        }
        // If we're in "remove" mode, we need products in the collection
        else if (mode === "remove" && cleanCollectionId) {
          const productsInCollection = await fetchCollectionProducts(cleanCollectionId)
          // Extract the actual product nodes from the edges
          const collectionProductNodes = productsInCollection?.edges?.map((edge) => edge.node) || []
          setProducts(collectionProductNodes)
        }
        // Fallback to all products if we can't determine which to show
        else {
          const allProducts = await fetchProducts()
          setProducts(allProducts)
        }

        // If we have a product ID, pre-select it
        if (cleanProductId) {
          setSelectedProducts([cleanProductId])
        }
      } catch (err) {
        console.error("Error loading products:", err)
        setError(`Error al cargar los productos: ${(err as Error).message}`)
        toast({
          title: "Error",
          description: `Error al cargar los productos: ${(err as Error).message}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [collectionId, productId, mode, toast])

  const handleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleCompleteAction = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Selección vacía",
        description: "Por favor, selecciona al menos un producto",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Ensure we have a clean collection ID
      const cleanCollectionId = collectionId
        ? collectionId.includes("/")
          ? collectionId
          : `gid://shopify/Collection/${collectionId}`
        : undefined

      if (!cleanCollectionId) {
        throw new Error("ID de colección no válido")
      }

      if (mode === "add") {
        // Process each product individually
        for (const productId of selectedProducts) {
          await addProductToCollection(cleanCollectionId, productId)
        }

        toast({
          title: "Productos añadidos",
          description: `${selectedProducts.length} productos añadidos a la colección`,
        })
      } else {
        // Process each product individually
        for (const productId of selectedProducts) {
          await removeProductFromCollection(cleanCollectionId, productId)
        }

        toast({
          title: "Productos eliminados",
          description: `${selectedProducts.length} productos eliminados de la colección`,
        })
      }

      // Reset selection
      setSelectedProducts([])

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete()
      }
    } catch (err) {
      console.error(`Error ${mode === "add" ? "añadiendo" : "eliminando"} productos:`, err)
      setError(`Error ${mode === "add" ? "añadiendo" : "eliminando"} productos: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `Error ${mode === "add" ? "añadiendo" : "eliminando"} productos: ${(err as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Get image URL from product
  const getProductImageUrl = (product) => {
    if (!product) return null

    if (product.featuredImage) return product.featuredImage.url
    if (product.images && product.images.edges && product.images.edges.length > 0)
      return product.images.edges[0].node.url
    if (product.image) return typeof product.image === "string" ? product.image : product.image?.url

    return null
  }

  // Filter products based on search term
  const filteredProducts = products.filter((product) => {
    // Filter by search term
    if (searchTerm) {
      return product.title.toLowerCase().includes(searchTerm.toLowerCase())
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4 space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {mode === "add"
                    ? "No hay productos disponibles para añadir a esta colección"
                    : "No hay productos en esta colección"}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductSelection(product.id)}
                    />
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      {getProductImageUrl(product) ? (
                        <Image
                          src={getProductImageUrl(product) || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor={`product-${product.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {product.title}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div>
          <span className="text-sm text-muted-foreground">{selectedProducts.length} productos seleccionados</span>
        </div>
        <Button onClick={handleCompleteAction} disabled={isProcessing || selectedProducts.length === 0}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "add" ? "Añadir productos" : "Eliminar productos"}
        </Button>
      </div>
    </div>
  )
}
