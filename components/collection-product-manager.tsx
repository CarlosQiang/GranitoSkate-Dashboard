"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Package, AlertCircle } from "lucide-react"
import { fetchProducts } from "@/lib/api/products"
import { addProductsToCollection, removeProductsFromCollection } from "@/lib/api/collections"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CollectionProductManagerProps {
  collectionId: string
  onComplete: () => void
  mode?: "add" | "remove"
}

export function CollectionProductManager({ collectionId, onComplete, mode = "add" }: CollectionProductManagerProps) {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState(mode)
  const isMounted = useRef(true)

  // Evitar problemas de memoria con componentes desmontados
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)

        // Intentar cargar productos
        let intentos = 0
        let productsData = []

        while (intentos < 3 && productsData.length === 0) {
          try {
            productsData = await fetchProducts({ limit: 50 })
            intentos++
          } catch (err) {
            console.warn(`Intento ${intentos} fallido:`, err)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Esperar 1 segundo entre intentos
          }
        }

        if (isMounted.current) {
          setProducts(productsData)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error al cargar productos:", err)
        if (isMounted.current) {
          setError("No se pudieron cargar los productos. Por favor, inténtalo de nuevo.")
          setIsLoading(false)
        }
      }
    }

    loadProducts()
  }, [])

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }))
  }

  const filteredProducts = products.filter((product) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      !searchTerm ||
      (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.vendor && product.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.productType && product.productType.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtrar por estado
    const matchesStatus = filter === "all" || product.status === filter

    return matchesSearch && matchesStatus
  })

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

      // Extraer los IDs limpios
      const cleanIds = selectedProducts.map((id) => {
        if (typeof id === "string" && id.includes("/")) {
          return id.split("/").pop()
        }
        return id
      })

      // Extraer el ID limpio de la colección
      const cleanCollectionId =
        typeof collectionId === "string" && collectionId.includes("/") ? collectionId.split("/").pop() : collectionId

      if (activeTab === "add") {
        await addProductsToCollection(cleanCollectionId, cleanIds)
      } else {
        await removeProductsFromCollection(cleanCollectionId, cleanIds)
      }

      if (isMounted.current) {
        setIsSubmitting(false)
        setSelectedProducts([])
        onComplete()
      }
    } catch (err) {
      console.error(`Error al ${activeTab === "add" ? "añadir" : "eliminar"} productos:`, err)

      if (isMounted.current) {
        setError(
          `No se pudieron ${
            activeTab === "add" ? "añadir" : "eliminar"
          } los productos a la colección. Por favor, inténtalo de nuevo.`,
        )
        setIsSubmitting(false)
      }
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((product) => product.id))
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue={mode} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="add">Añadir productos</TabsTrigger>
          <TabsTrigger value="remove">Eliminar productos</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="DRAFT">Borradores</SelectItem>
                <SelectItem value="ARCHIVED">Archivados</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSubmit}
              disabled={selectedProducts.length === 0 || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Añadiendo...
                </>
              ) : (
                <>
                  Añadir {selectedProducts.length} {selectedProducts.length === 1 ? "producto" : "productos"}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedProducts.length === filteredProducts.length ? "Deseleccionar todos" : "Seleccionar todos"}
            </Button>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} productos encontrados</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const hasImageError = imageErrors[product.id] || false
                const imageUrl = product.image?.url || product.featuredImage?.url || null
                const title = product.title || "Producto sin título"
                const price = product.price || product.variants?.edges?.[0]?.node?.price || "0,00"
                const status = product.status || "DRAFT"

                return (
                  <Card
                    key={product.id}
                    className={`overflow-hidden cursor-pointer transition-all ${
                      selectedProducts.includes(product.id) ? "ring-2 ring-primary" : ""
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
          )}
        </TabsContent>

        <TabsContent value="remove" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos para eliminar..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selectedProducts.length === 0 || isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  Eliminar {selectedProducts.length} {selectedProducts.length === 1 ? "producto" : "productos"}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedProducts.length === filteredProducts.length ? "Deseleccionar todos" : "Seleccionar todos"}
            </Button>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} productos encontrados</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron productos para eliminar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const hasImageError = imageErrors[product.id] || false
                const imageUrl = product.image?.url || product.featuredImage?.url || null
                const title = product.title || "Producto sin título"
                const price = product.price || product.variants?.edges?.[0]?.node?.price || "0,00"
                const status = product.status || "DRAFT"

                return (
                  <Card
                    key={product.id}
                    className={`overflow-hidden cursor-pointer transition-all ${
                      selectedProducts.includes(product.id) ? "ring-2 ring-destructive" : ""
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
