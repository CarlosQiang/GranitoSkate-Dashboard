"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { fetchCollectionProducts, addProductsToCollection, removeProductsFromCollection } from "@/lib/api/collections"
import { fetchProducts } from "@/lib/api/products"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Product {
  id: string
  title: string
  handle: string
  image?: {
    url: string
    altText: string
  }
  price?: string
}

interface CollectionProductManagerProps {
  collectionId: string
  onComplete: () => void
  mode: "add" | "remove"
}

export function CollectionProductManager({ collectionId, onComplete, mode }: CollectionProductManagerProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar productos de la colección
  useEffect(() => {
    async function loadCollectionProducts() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchCollectionProducts(collectionId)

        // Asegurarse de que response.edges existe y es un array
        if (response && response.edges && Array.isArray(response.edges)) {
          const products = response.edges.map((edge) => ({
            id: edge.node.id,
            title: edge.node.title,
            handle: edge.node.handle,
            image: edge.node.images?.edges?.[0]?.node || null,
            price: edge.node.priceRangeV2?.minVariantPrice?.amount,
          }))
          setCollectionProducts(products)

          // Extraer IDs para mostrar en la consola
          const productIds = products.map((p) => {
            // Asegurarse de que el ID es una cadena y extraer el ID numérico
            const idString = typeof p.id === "string" ? p.id : String(p.id)
            const matches = idString.match(/\/([^/]+)$/)
            return matches ? matches[1] : idString
          })

          console.log("IDs de productos en la colección:", productIds)
          console.log("Total de productos en la colección:", products.length)
        } else {
          console.error("Formato de respuesta inesperado:", response)
          setCollectionProducts([])
        }
      } catch (err) {
        console.error("Error al cargar productos de la colección:", err)
        setError(`Error al cargar productos de la colección: ${(err as Error).message}`)
        setCollectionProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadCollectionProducts()
  }, [collectionId])

  // Cargar productos disponibles (para el modo "add")
  useEffect(() => {
    if (mode !== "add") return

    async function loadAvailableProducts() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchProducts()

        // Asegurarse de que response.edges existe y es un array
        if (response && response.edges && Array.isArray(response.edges)) {
          const allProducts = response.edges.map((edge) => ({
            id: edge.node.id,
            title: edge.node.title,
            handle: edge.node.handle,
            image: edge.node.images?.edges?.[0]?.node || null,
            price: edge.node.priceRangeV2?.minVariantPrice?.amount,
          }))

          // Filtrar productos que ya están en la colección
          const collectionProductIds = new Set(collectionProducts.map((p) => p.id))
          const available = allProducts.filter((p) => !collectionProductIds.has(p.id))
          setAvailableProducts(available)
          console.log("Productos disponibles para añadir:", available.length)
        } else {
          console.error("Formato de respuesta inesperado:", response)
          setAvailableProducts([])
        }
      } catch (err) {
        console.error("Error al cargar productos disponibles:", err)
        setError(`Error al cargar productos disponibles: ${(err as Error).message}`)
        setAvailableProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (collectionProducts.length > 0) {
      loadAvailableProducts()
    }
  }, [collectionProducts, mode])

  // Función para filtrar productos por término de búsqueda
  const filteredProducts = (mode === "add" ? availableProducts : collectionProducts).filter((product) => {
    // Asegurarse de que product.title es una cadena antes de llamar a toLowerCase
    const title = typeof product.title === "string" ? product.title.toLowerCase() : ""
    const search = searchTerm.toLowerCase()
    return title.includes(search)
  })

  // Manejar selección de productos
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Selección vacía",
        description: "Por favor, selecciona al menos un producto.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      if (mode === "add") {
        await addProductsToCollection(collectionId, selectedProducts)
        toast({
          title: "Productos añadidos",
          description: `Se han añadido ${selectedProducts.length} productos a la colección.`,
        })
      } else {
        await removeProductsFromCollection(collectionId, selectedProducts)
        toast({
          title: "Productos eliminados",
          description: `Se han eliminado ${selectedProducts.length} productos de la colección.`,
        })
      }

      onComplete()
    } catch (err) {
      console.error(`Error al ${mode === "add" ? "añadir" : "eliminar"} productos:`, err)
      setError(`Error al ${mode === "add" ? "añadir" : "eliminar"} productos: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `No se pudieron ${mode === "add" ? "añadir" : "eliminar"} los productos. ${(err as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para formatear el precio
  const formatPrice = (price: string | undefined) => {
    if (!price) return "N/A"
    try {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(Number(price))
    } catch (error) {
      console.error("Error al formatear precio:", error)
      return price
    }
  }

  // Función para extraer el ID numérico de un ID de Shopify
  const extractShopifyId = (id: string) => {
    if (!id) return "ID no disponible"

    // Asegurarse de que id es una cadena
    const idString = typeof id === "string" ? id : String(id)

    // Extraer el ID numérico del final de la cadena
    const matches = idString.match(/\/([^/]+)$/)
    return matches ? matches[1] : idString
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Añadir productos a la colección" : "Eliminar productos de la colección"}
        </CardTitle>
        <CardDescription>
          {mode === "add"
            ? "Selecciona los productos que deseas añadir a esta colección."
            : "Selecciona los productos que deseas eliminar de esta colección."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando productos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {mode === "add"
              ? availableProducts.length === 0
                ? "No hay productos disponibles para añadir a esta colección."
                : "No se encontraron productos que coincidan con tu búsqueda."
              : collectionProducts.length === 0
                ? "Esta colección no tiene productos."
                : "No se encontraron productos que coincidan con tu búsqueda."}
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent">
                <Checkbox
                  id={`product-${extractShopifyId(product.id)}`}
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => handleSelectProduct(product.id, checked === true)}
                />
                <Label
                  htmlFor={`product-${extractShopifyId(product.id)}`}
                  className="flex-1 flex justify-between items-center cursor-pointer"
                >
                  <span>{product.title}</span>
                  <span className="text-sm text-muted-foreground">{formatPrice(product.price)}</span>
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onComplete}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || selectedProducts.length === 0}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "add" ? "Añadir productos" : "Eliminar productos"} ({selectedProducts.length})
        </Button>
      </CardFooter>
    </Card>
  )
}
