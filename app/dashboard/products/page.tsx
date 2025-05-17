"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { ProductsList } from "@/components/products-list"
import { fetchProducts } from "@/lib/api/products"
import { LoadingState } from "@/components/loading-state"

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
        <Button onClick={() => router.push("/dashboard/products/new")}>
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
            <div className="flex items-center space-x-2">
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
              <Button onClick={syncProducts} disabled={isSyncing} variant="outline">
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="draft">Borradores</TabsTrigger>
                <TabsTrigger value="archived">Archivados</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando productos..." />
                ) : (
                  <ProductsList products={filteredProducts} onRefresh={loadProducts} />
                )}
              </TabsContent>
              <TabsContent value="active" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando productos activos..." />
                ) : (
                  <ProductsList products={filteredProducts} onRefresh={loadProducts} />
                )}
              </TabsContent>
              <TabsContent value="draft" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando borradores..." />
                ) : (
                  <ProductsList products={filteredProducts} onRefresh={loadProducts} />
                )}
              </TabsContent>
              <TabsContent value="archived" className="mt-4">
                {isLoading ? (
                  <LoadingState message="Cargando productos archivados..." />
                ) : (
                  <ProductsList products={filteredProducts} onRefresh={loadProducts} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
