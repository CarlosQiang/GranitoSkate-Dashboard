"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Package, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { fetchProducts, fetchProductsByStatus } from "@/lib/api/products"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductsList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    draft: 0,
    archived: 0,
  })

  // Cargar productos según la pestaña activa
  const loadProducts = async (tab = activeTab) => {
    setLoading(true)
    setError(null)
    try {
      let data

      // Cargar productos según la pestaña seleccionada
      if (tab === "all") {
        data = await fetchProducts(100)
      } else {
        // Convertir el nombre de la pestaña al formato que espera la API
        const status = tab.toUpperCase()
        data = await fetchProductsByStatus(status, 100)
      }

      // Actualizar los productos y aplicar filtro de búsqueda
      setProducts(data || [])
      filterProductsBySearch(data, searchTerm)

      // Actualizar contadores solo si estamos en la pestaña "all"
      if (tab === "all") {
        updateCounts(data)
      }
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  // Actualizar contadores de productos por estado
  const updateCounts = (data) => {
    const newCounts = {
      all: data.length,
      active: data.filter((p) => p.status === "ACTIVE").length,
      draft: data.filter((p) => p.status === "DRAFT").length,
      archived: data.filter((p) => p.status === "ARCHIVED").length,
    }
    setCounts(newCounts)
  }

  // Filtrar productos por término de búsqueda
  const filterProductsBySearch = (productsData, term) => {
    if (!term) {
      setFilteredProducts(productsData)
      return
    }

    const filtered = productsData.filter(
      (product) =>
        product.title?.toLowerCase().includes(term.toLowerCase()) ||
        product.productType?.toLowerCase().includes(term.toLowerCase()) ||
        product.vendor?.toLowerCase().includes(term.toLowerCase()),
    )

    setFilteredProducts(filtered)
  }

  // Manejar cambio de pestaña
  const handleTabChange = (value) => {
    setActiveTab(value)
    loadProducts(value)
  }

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    filterProductsBySearch(products, term)
  }

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [])

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-full max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20 ml-1" />
            <Skeleton className="h-10 w-20 ml-1" />
            <Skeleton className="h-10 w-20 ml-1" />
          </TabsList>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-md overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
          </div>
        </Tabs>
      </div>
    )
  }

  // Renderizar estado de error
  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => loadProducts()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </Card>
    )
  }

  // Renderizar estado vacío
  if (products.length === 0 && !loading && !error) {
    return (
      <Card className="p-6 text-center">
        <Package className="h-12 w-12 mx-auto text-granito-500 mb-4" />
        <p className="text-muted-foreground mb-4">No hay productos disponibles en tu tienda Shopify</p>
        <Button asChild className="bg-granito-500 hover:bg-granito-600">
          <a href="/dashboard/products/new">Crear primer producto</a>
        </Button>
      </Card>
    )
  }

  // Renderizar lista de productos
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Button variant="outline" onClick={() => loadProducts()} className="border-granito-300 hover:bg-granito-50">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-muted/60 w-full justify-start mb-4">
          <TabsTrigger value="all" className="data-[state=active]:bg-granito-500 data-[state=active]:text-white">
            Todos
            <Badge variant="outline" className="ml-2 bg-white/20">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-granito-500 data-[state=active]:text-white">
            Activos
            <Badge variant="outline" className="ml-2 bg-white/20">
              {counts.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-granito-500 data-[state=active]:text-white">
            Borradores
            <Badge variant="outline" className="ml-2 bg-white/20">
              {counts.draft}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-granito-500 data-[state=active]:text-white">
            Archivados
            <Badge variant="outline" className="ml-2 bg-white/20">
              {counts.archived}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No se encontraron productos</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchTerm
                  ? `No hay resultados para "${searchTerm}"`
                  : `No hay productos ${
                      activeTab === "all"
                        ? ""
                        : activeTab === "active"
                          ? "activos"
                          : activeTab === "draft"
                            ? "en borrador"
                            : "archivados"
                    }`}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  loadProducts()
                }}
                variant="outline"
                className="mr-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
              <Button asChild className="bg-granito-500 hover:bg-granito-600">
                <a href="/dashboard/products/new">Crear nuevo producto</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
