"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Package, AlertCircle } from "lucide-react"
import { fetchProducts } from "@/lib/api/productos"
import { fetchCollectionById } from "@/lib/api/collections"
import { addProductsToCollection, removeProductsFromCollection } from "@/lib/api/collections"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getImageUrl } from "@/lib/utils"
import { formatShopifyId } from "@/lib/shopify"
import { useToast } from "@/components/ui/use-toast"

interface CollectionProductManagerProps {
  collectionId: string
  onComplete: () => void
  mode: "add" | "remove"
}

export function CollectionProductManager({ collectionId, onComplete, mode }: CollectionProductManagerProps) {
  const { toast } = useToast()
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [collectionProducts, setCollectionProducts] = useState<any[]>([])
  const [displayProducts, setDisplayProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const isMounted = useRef(true)

  // Evitar problemas de memoria con componentes desmontados
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Cargar productos y colección
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        // Asegurarse de que el ID de la colección tenga el formato correcto
        const formattedCollectionId = formatShopifyId(collectionId, "Collection")

        // Cargar todos los productos
        const productsData = await fetchProducts({ limite: 250 })

        if (!productsData || !Array.isArray(productsData)) {
          throw new Error("No se pudieron cargar los productos correctamente")
        }

        if (isMounted.current) {
          setAllProducts(productsData)
        }

        // Cargar la colección para obtener sus productos
        try {
          const collectionData = await fetchCollectionById(formattedCollectionId)

          if (!collectionData) {
            throw new Error("No se pudo cargar la información de la colección")
          }

          // Asegurarse de que collectionData.products sea un array
          let collectionProductsArray = []
          if (collectionData.products) {
            if (Array.isArray(collectionData.products)) {
              collectionProductsArray = collectionData.products
            } else if (collectionData.products.edges && Array.isArray(collectionData.products.edges)) {
              collectionProductsArray = collectionData.products.edges.map((edge: any) => edge.node)
            }
          }

          if (isMounted.current) {
            setCollectionProducts(collectionProductsArray)

            // Crear un conjunto de IDs de productos en la colección para búsqueda rápida
            const collectionProductIds = new Set(
              collectionProductsArray.map((product: any) => {
                // Normalizar IDs para comparación
                const productId =
                  typeof product.id === "string" && product.id.includes("/") ? product.id.split("/").pop() : product.id
                return productId
              }),
            )

            console.log("IDs de productos en la colección:", Array.from(collectionProductIds))
            console.log("Total de productos en la colección:", collectionProductIds.size)

            // Filtrar productos según el modo
            if (mode === "add") {
              // Para añadir: mostrar solo productos que NO están en la colección
              const productsToAdd = productsData.filter((product: any) => {
                const productId =
                  typeof product.id === "string" && product.id.includes("/") ? product.id.split("/").pop() : product.id
                return !collectionProductIds.has(productId)
              })

              console.log("Productos disponibles para añadir:", productsToAdd.length)
              setDisplayProducts(productsToAdd)
            } else {
              // Para eliminar: mostrar solo productos que SÍ están en la colección
              const productsToRemove = productsData.filter((product: any) => {
                const productId =
                  typeof product.id === "string" && product.id.includes("/") ? product.id.split("/").pop() : product.id
                return collectionProductIds.has(productId)
              })

              console.log("Productos disponibles para eliminar:", productsToRemove.length)
              setDisplayProducts(productsToRemove)
            }
          }
        } catch (err) {
          console.error("Error al cargar la colección:", err)

          if (isMounted.current) {
            // En caso de error, mostrar todos los productos en modo añadir
            if (mode === "add") {
              setDisplayProducts(productsData)
            } else {
              setDisplayProducts([])
            }

            setError(`Error al cargar la colección: ${(err as Error).message}`)
          }
        }
      } catch (err) {
        console.error("Error al cargar productos:", err)

        if (isMounted.current) {
          setError(`Error al cargar productos: ${(err as Error).message}`)
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [collectionId, mode])

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      return
    }

    const lowerSearchTerm = searchTerm.toLowerCase()

    // Filtrar los productos según el término de búsqueda
    const searchResults = displayProducts.filter((product) => {
      const title = (product.titulo || product.title || "").toLowerCase()
      return title.includes(lowerSearchTerm)
    })

    setDisplayProducts(searchResults)
  }, [searchTerm])

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }))
  }

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

      // Asegurarse de que el ID de la colección tenga el formato correcto
      const formattedCollectionId = formatShopifyId(collectionId, "Collection")

      // Extraer los IDs limpios y formatearlos correctamente
      const formattedProductIds = selectedProducts.map((id) => formatShopifyId(id, "Product"))

      console.log("Operación de productos en colección:", {
        mode,
        collectionId: formattedCollectionId,
        productIds: formattedProductIds,
      })

      if (mode === "add") {
        await addProductsToCollection(formattedCollectionId, formattedProductIds)
      } else {
        await removeProductsFromCollection(formattedCollectionId, formattedProductIds)
      }

      if (isMounted.current) {
        setIsSubmitting(false)
        toast({
          title: "Operación completada",
          description: `Productos ${mode === "add" ? "añadidos a" : "eliminados de"} la colección correctamente`,
        })
        onComplete()
      }
    } catch (err) {
      console.error(`Error al ${mode === "add" ? "añadir" : "eliminar"} productos:`, err)

      if (isMounted.current) {
        setError(
          `No se pudieron ${
            mode === "add" ? "añadir" : "eliminar"
          } los productos a la colección. Por favor, inténtalo de nuevo.`,
        )
        setIsSubmitting(false)
        toast({
          title: "Error",
          description: `Error al ${mode === "add" ? "añadir" : "eliminar"} productos: ${(err as Error).message}`,
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-granito mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Alert>
    )
  }

  // Filtrar productos por búsqueda
  const filteredProducts =
    searchTerm.trim() === ""
      ? displayProducts
      : displayProducts.filter((product) => {
          const title = (product.titulo || product.title || "").toLowerCase()
          return title.includes(searchTerm.toLowerCase())
        })

  // Mensaje cuando no hay productos para mostrar
  if (filteredProducts.length === 0) {
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
        </div>

        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {mode === "add"
              ? "No hay productos disponibles para añadir a esta colección"
              : "No hay productos en esta colección para eliminar"}
          </p>
        </div>
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
        <Button
          onClick={handleSubmit}
          disabled={selectedProducts.length === 0 || isSubmitting}
          className="bg-granito hover:bg-granito/90"
        >
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const hasImageError = imageErrors[product.id] || false
          const imageUrl = getImageUrl(product)
          const title = product.titulo || product.title || "Producto sin título"
          const price = product.precio || product.price || 0
          const status = product.estado || product.status || "DRAFT"

          return (
            <Card
              key={product.id}
              className={`overflow-hidden cursor-pointer transition-all ${
                selectedProducts.includes(product.id) ? "ring-2 ring-granito" : ""
              }`}
              onClick={() => handleToggleProduct(product.id)}
            >
              <div className="aspect-square relative">
                {!hasImageError && imageUrl ? (
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={title}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(product.id)}
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
                <h3 className="font-medium truncate">{title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium">{price} €</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {status === "ACTIVE" ? "Visible" : "Oculto"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
