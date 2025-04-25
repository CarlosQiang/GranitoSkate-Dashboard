"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchCollections } from "@/lib/api/collections"
import { fetchRecentProducts } from "@/lib/api/products"
import { addProductsToCollection, removeProductsFromCollection } from "@/lib/api/products"
import { Search, Plus, Trash, Check } from "lucide-react"

interface Product {
  id: string
  title: string
  handle: string
  status: string
  totalInventory: number
  featuredImage: {
    url: string
  } | null
}

interface Collection {
  id: string
  title: string
  handle: string
  productsCount: number
  image: {
    url: string
  } | null
}

interface CollectionProductManagerProps {
  productId?: string // Si se proporciona, se preselecciona este producto
  collectionId?: string // Si se proporciona, se preselecciona esta colección
  onComplete?: () => void
}

export function CollectionProductManager({ productId, collectionId, onComplete }: CollectionProductManagerProps) {
  const { toast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(collectionId || null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>(productId ? [productId] : [])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<"add" | "remove">("add")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [collectionsData, productsData] = await Promise.all([
          fetchCollections(),
          fetchRecentProducts(50), // Obtener más productos para tener una buena selección
        ])
        setCollections(collectionsData)
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const filteredProducts = products.filter((product) => product.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSubmit = async () => {
    if (!selectedCollection || selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar una colección y al menos un producto",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === "add") {
        await addProductsToCollection(selectedCollection, selectedProducts)
        toast({
          title: "Productos añadidos",
          description: "Los productos han sido añadidos a la colección correctamente",
        })
      } else {
        await removeProductsFromCollection(selectedCollection, selectedProducts)
        toast({
          title: "Productos eliminados",
          description: "Los productos han sido eliminados de la colección correctamente",
        })
      }

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: `No se pudo completar la operación: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar productos en colecciones</CardTitle>
        <CardDescription>
          {mode === "add" ? "Añade productos a una colección" : "Elimina productos de una colección"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant={mode === "add" ? "default" : "outline"} onClick={() => setMode("add")} className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Añadir productos
          </Button>
          <Button
            variant={mode === "remove" ? "default" : "outline"}
            onClick={() => setMode("remove")}
            className="flex-1"
          >
            <Trash className="mr-2 h-4 w-4" />
            Eliminar productos
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection">Colección</Label>
          <select
            id="collection"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedCollection || ""}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value="">Selecciona una colección</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title} ({collection.productsCount} productos)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">Buscar productos</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md">
          <div className="p-4 border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Productos</span>
              <span className="text-sm text-muted-foreground">{selectedProducts.length} seleccionados</span>
            </div>
          </div>
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No se encontraron productos</p>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts([...selectedProducts, product.id])
                        } else {
                          setSelectedProducts(selectedProducts.filter((id) => id !== product.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={`product-${product.id}`}
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{product.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.status === "ACTIVE" ? "Activo" : "Borrador"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting || !selectedCollection || selectedProducts.length === 0}>
          {isSubmitting ? (
            "Procesando..."
          ) : mode === "add" ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Añadir a colección
            </>
          ) : (
            <>
              <Trash className="mr-2 h-4 w-4" />
              Eliminar de colección
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
