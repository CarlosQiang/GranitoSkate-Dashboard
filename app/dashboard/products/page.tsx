"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, RefreshCw } from "lucide-react"
import { fetchProducts } from "@/lib/api/products"
import { LoadingState } from "@/components/loading-state"
import { ProductCard } from "@/components/product-card" // Import ProductCard

// Marcar la página como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)

  // Función para cargar productos
  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchProducts(100) // Obtener hasta 100 productos
      setProducts(data)
      filterProducts(data, searchTerm, activeTab)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setError("No se pudieron cargar los productos. Intente nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar productos según búsqueda y pestaña activa
  const filterProducts = (productsData, search, tab) => {
    let filtered = productsData

    // Filtrar por término de búsqueda
    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(search.toLowerCase()) ||
          product.vendor?.toLowerCase().includes(search.toLowerCase()) ||
          product.productType?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Filtrar por estado (pestaña)
    if (tab !== "all") {
      filtered = filtered.filter((product) => {
        if (tab === "active") return product.status === "ACTIVE"
        if (tab === "draft") return product.status === "DRAFT"
        if (tab === "archived") return product.status === "ARCHIVED"
        return true
      })
    }

    setFilteredProducts(filtered)
  }

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [])

  // Actualizar filtros cuando cambian los criterios
  useEffect(() => {
    filterProducts(products, searchTerm, activeTab)
  }, [searchTerm, activeTab, products])

  // Manejar cambio de pestaña
  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Función para sincronizar productos con Shopify
  const syncProducts = async () => {
    setIsSyncing(true)
    setError(null)
    try {
      // Llamar a la API para sincronizar productos
      const response = await fetch("/api/sync/products")
      if (!response.ok) {
        throw new Error("Error al sincronizar productos")
      }

      // Recargar productos después de sincronizar
      await loadProducts()
    } catch (error) {
      console.error("Error al sincronizar productos:", error)
      setError("No se pudieron sincronizar los productos. Intente nuevamente más tarde.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <Button onClick={() => router.push("/dashboard/products/new")} className="bg-granito-500 hover:bg-granito-600">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestiona los productos de tu tienda</CardTitle>
          <CardDescription>Visualiza, edita y crea nuevos productos para tu tienda online.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button
                onClick={syncProducts}
                disabled={isSyncing}
                variant="outline"
                className="border-granito-300 hover:bg-granito-50"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sincronizar
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-muted/60">
                <TabsTrigger value="all" className="data-[state=active]:bg-granito-500 data-[state=active]:text-white">
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-granito-500 data-[state=active]:text-white"
                >
                  Activos
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="data-[state=active]:bg-granito-500 data-[state=active]:text-white"
                >
                  Borradores
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="data-[state=active]:bg-granito-500 data-[state=active]:text-white"
                >
                  Archivados
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando productos..." />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="active" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando productos activos..." />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="draft" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando borradores..." />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="archived" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando productos archivados..." />
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
        </CardContent>
      </Card>
    </div>
  )
}
