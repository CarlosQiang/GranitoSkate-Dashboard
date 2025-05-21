"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { SyncButton } from "@/components/sync-button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Plus } from "lucide-react"

export default function ProductsPageClient() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      filterProducts()
    }
  }, [searchTerm, activeTab, products])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Primero intentamos obtener de la base de datos
      const dbResponse = await fetch("/api/db/productos")

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (dbData.success && dbData.data && dbData.data.length > 0) {
          setProducts(dbData.data)
          setIsLoading(false)
          return
        }
      }

      // Si no hay datos en la base de datos, obtenemos de la caché
      const cacheResponse = await fetch("/api/cached/products?transform=true")

      if (!cacheResponse.ok) {
        throw new Error("Error al cargar productos")
      }

      const cacheData = await cacheResponse.json()
      setProducts(cacheData)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por estado
    if (activeTab !== "todos") {
      filtered = filtered.filter((product) => {
        const status = product.estado || product.status
        if (activeTab === "activos") return status === "ACTIVE" || status === "active"
        if (activeTab === "borradores") return status === "DRAFT" || status === "draft"
        if (activeTab === "archivados") return status === "ARCHIVED" || status === "archived"
        return true
      })
    }

    setFilteredProducts(filtered)
  }

  const handleSyncSuccess = () => {
    toast({
      title: "Sincronización completada",
      description: "Los productos se han sincronizado correctamente",
    })
    fetchProducts()
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const getActiveCount = () => {
    return products.filter(
      (p) => p.estado === "ACTIVE" || p.estado === "active" || p.status === "ACTIVE" || p.status === "active",
    ).length
  }

  const getDraftCount = () => {
    return products.filter(
      (p) => p.estado === "DRAFT" || p.estado === "draft" || p.status === "DRAFT" || p.status === "draft",
    ).length
  }

  const getArchivedCount = () => {
    return products.filter(
      (p) => p.estado === "ARCHIVED" || p.estado === "archived" || p.status === "ARCHIVED" || p.status === "archived",
    ).length
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona los productos de tu tienda Shopify</p>
        </div>
        <div className="flex gap-2">
          <SyncButton entityType="productos" onSuccess={handleSyncSuccess} variant="outline" />
          <Button asChild>
            <a href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </a>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar productos..." className="pl-8" value={searchTerm} onChange={handleSearch} />
            </div>
            <div className="flex-1 w-full md:w-auto">
              <Tabs defaultValue="todos" value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="todos" className="flex-1">
                    Todos ({products.length})
                  </TabsTrigger>
                  <TabsTrigger value="activos" className="flex-1">
                    Activos ({getActiveCount()})
                  </TabsTrigger>
                  <TabsTrigger value="borradores" className="flex-1">
                    Borradores ({getDraftCount()})
                  </TabsTrigger>
                  <TabsTrigger value="archivados" className="flex-1">
                    Archivados ({getArchivedCount()})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando productos...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-background">
          <p className="text-muted-foreground mb-4">No se encontraron productos</p>
          <Button variant="outline" onClick={fetchProducts}>
            Recargar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product.shopify_id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
