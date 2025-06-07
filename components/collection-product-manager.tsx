"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { fetchProducts } from "@/lib/api/products"
import {
  fetchCollectionProducts,
  addProductsToCollection,
  removeProductsFromCollection,
  fetchProductsNotInCollection,
} from "@/lib/api/colecciones"
import { Loader2, Package, Eye, Plus, Minus } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface CollectionProductManagerProps {
  productId?: string
  collectionId?: string
  onComplete?: () => void
  mode: "add" | "remove" | "view"
}

export function CollectionProductManager({ productId, collectionId, onComplete, mode }: CollectionProductManagerProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
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

        if (mode === "add" && cleanCollectionId) {
          const productsNotInCollection = await fetchProductsNotInCollection(cleanCollectionId)
          setProducts(productsNotInCollection.edges.map((edge) => edge.node))
        } else if ((mode === "remove" || mode === "view") && cleanCollectionId) {
          const productsInCollection = await fetchCollectionProducts(cleanCollectionId)
          const collectionProductNodes = productsInCollection?.edges?.map((edge) => edge.node) || []
          setProducts(collectionProductNodes)
        } else {
          const allProducts = await fetchProducts()
          setProducts(allProducts)
        }

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
    if (mode === "view") return // No permitir selección en modo vista

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
      const cleanCollectionId = collectionId
        ? collectionId.includes("/")
          ? collectionId
          : `gid://shopify/Collection/${collectionId}`
        : undefined

      if (!cleanCollectionId) {
        throw new Error("ID de colección no válido")
      }

      if (mode === "add") {
        await addProductsToCollection(cleanCollectionId, selectedProducts)
        toast({
          title: "Productos añadidos",
          description: `${selectedProducts.length} productos añadidos a la colección`,
        })
      } else if (mode === "remove") {
        await removeProductsFromCollection(cleanCollectionId, selectedProducts)
        toast({
          title: "Productos eliminados",
          description: `${selectedProducts.length} productos eliminados de la colección`,
        })
      }

      setSelectedProducts([])

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

  const getProductImageUrl = (product) => {
    if (!product) return null
    if (product.featuredImage) return product.featuredImage.url
    if (product.images && product.images.edges && product.images.edges.length > 0)
      return product.images.edges[0].node.url
    if (product.image) return typeof product.image === "string" ? product.image : product.image?.url
    return null
  }

  const filteredProducts = products.filter((product) => {
    if (searchTerm) {
      return product.title.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const getModeConfig = () => {
    switch (mode) {
      case "view":
        return {
          title: "Productos en la colección",
          icon: Eye,
          description: "Vista de todos los productos en esta colección",
          showActions: false,
        }
      case "add":
        return {
          title: "Añadir productos",
          icon: Plus,
          description: "Selecciona productos para añadir a la colección",
          showActions: true,
        }
      case "remove":
        return {
          title: "Eliminar productos",
          icon: Minus,
          description: "Selecciona productos para eliminar de la colección",
          showActions: true,
        }
    }
  }

  const config = getModeConfig()

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
        <div className="flex items-center mb-2">
          <config.icon className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <config.icon className="h-5 w-5" />
        <div>
          <h3 className="font-semibold">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <Input
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {/* Eliminamos el Card wrapper para quitar el doble marco */}
      <div className="border rounded-md">
        <ScrollArea className="h-[400px] w-full">
          <div className="p-4 space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {mode === "add"
                  ? "No hay productos disponibles para añadir a esta colección"
                  : mode === "view"
                    ? "No hay productos en esta colección"
                    : "No hay productos en esta colección"}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                  {config.showActions && (
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductSelection(product.id)}
                    />
                  )}
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
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{product.title}</p>
                    {product.vendor && <p className="text-xs text-muted-foreground mt-1">{product.vendor}</p>}
                  </div>
                  {mode === "view" && (
                    <div className="text-xs text-muted-foreground">{product.totalInventory || 0} en stock</div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {config.showActions && (
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">{selectedProducts.length} productos seleccionados</span>
          </div>
          <Button onClick={handleCompleteAction} disabled={isProcessing || selectedProducts.length === 0}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "add" ? "Añadir productos" : "Eliminar productos"}
          </Button>
        </div>
      )}

      {mode === "view" && (
        <div className="text-center text-sm text-muted-foreground">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} en esta colección
        </div>
      )}
    </div>
  )
}
