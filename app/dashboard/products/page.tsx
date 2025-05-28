"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, RefreshCw, ArrowUpDown, Grid3X3, List, Package, AlertCircle } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

// Función helper para limpiar IDs
const cleanId = (id: string | undefined) => {
  if (!id) return ""
  if (typeof id === "string" && id.includes("/")) {
    return id.split("/").pop() || ""
  }
  return id
}

// Función helper para obtener URL de imagen
const getImageUrl = (product: any) => {
  if (!product) return null

  if (product.imagen) return product.imagen
  if (product.image) return typeof product.image === "string" ? product.image : product.image?.url || product.image?.src

  if (product.featuredImage) return product.featuredImage.url || product.featuredImage.src

  if (product.imagenes && product.imagenes.length > 0) {
    return product.imagenes[0].src || product.imagenes[0].url
  }

  if (product.images && product.images.length > 0) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url || product.images[0]?.src
  }

  if (product.images && product.images.edges && product.images.edges.length > 0) {
    return product.images.edges[0].node.url || product.images.edges[0].node.src
  }

  return null
}

// Función helper para formatear moneda
const formatCurrency = (amount: number | string, currency = "EUR") => {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(num || 0)
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("title-asc")

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/shopify/products")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Normalizar datos de productos
      const normalizedProducts = Array.isArray(data) ? data : data.products || []

      console.log("Productos cargados:", normalizedProducts.length)
      setProducts(normalizedProducts)
      filterAndSortProducts(normalizedProducts, searchTerm, activeTab, sortBy)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setError("No se pudieron cargar los productos. Intente nuevamente más tarde.")
      setProducts([])
      setFilteredProducts([])

      toast({
        title: "Error al cargar productos",
        description: "No se pudieron cargar los productos. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortProducts = (productsData: any[], search: string, tab: string, sort: string) => {
    try {
      let filtered = [...productsData]

      // Filtro por búsqueda
      if (search) {
        filtered = filtered.filter(
          (product) =>
            product.title?.toLowerCase().includes(search.toLowerCase()) ||
            product.vendor?.toLowerCase().includes(search.toLowerCase()) ||
            product.productType?.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Filtro por estado
      if (tab !== "all") {
        const statusMap = {
          active: "ACTIVE",
          draft: "DRAFT",
          archived: "ARCHIVED",
        }

        const statusToFilter = statusMap[tab as keyof typeof statusMap]
        if (statusToFilter) {
          filtered = filtered.filter((product) => product.status === statusToFilter)
        }
      }

      // Ordenamiento
      filtered.sort((a, b) => {
        switch (sort) {
          case "title-asc":
            return (a.title || "").localeCompare(b.title || "")
          case "title-desc":
            return (b.title || "").localeCompare(a.title || "")
          case "date-asc":
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          case "date-desc":
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          case "price-asc":
            return (Number.parseFloat(a.price) || 0) - (Number.parseFloat(b.price) || 0)
          case "price-desc":
            return (Number.parseFloat(b.price) || 0) - (Number.parseFloat(a.price) || 0)
          default:
            return 0
        }
      })

      setFilteredProducts(filtered)
    } catch (error) {
      console.error("Error al filtrar productos:", error)
      setFilteredProducts([])
    }
  }

  useEffect(() => {
    loadProducts()

    const savedViewMode = localStorage.getItem("productsViewMode")
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }

    const savedSortBy = localStorage.getItem("productsSortBy")
    if (savedSortBy) {
      setSortBy(savedSortBy)
    }
  }, [])

  useEffect(() => {
    filterAndSortProducts(products, searchTerm, activeTab, sortBy)
  }, [searchTerm, activeTab, sortBy, products])

  useEffect(() => {
    localStorage.setItem("productsViewMode", viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem("productsSortBy", sortBy)
  }, [sortBy])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const syncProducts = async () => {
    setIsSyncing(true)
    setError(null)
    try {
      const response = await fetch("/api/sync/products")
      if (!response.ok) {
        throw new Error("Error al sincronizar productos")
      }

      toast({
        title: "Sincronización completada",
        description: "Los productos se han sincronizado correctamente con Shopify.",
      })

      await loadProducts()
    } catch (error) {
      console.error("Error al sincronizar productos:", error)
      setError("No se pudieron sincronizar los productos. Intente nuevamente más tarde.")
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los productos. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getSortTitle = () => {
    switch (sortBy) {
      case "title-asc":
        return "Nombre (A-Z)"
      case "title-desc":
        return "Nombre (Z-A)"
      case "date-asc":
        return "Fecha (Antiguo primero)"
      case "date-desc":
        return "Fecha (Reciente primero)"
      case "price-asc":
        return "Precio (Menor primero)"
      case "price-desc":
        return "Precio (Mayor primero)"
      default:
        return "Ordenar por"
    }
  }

  // Calcular contadores para cada pestaña
  const getCounts = () => {
    return {
      all: products.length,
      active: products.filter((p) => p.status === "ACTIVE").length,
      draft: products.filter((p) => p.status === "DRAFT").length,
      archived: products.filter((p) => p.status === "ARCHIVED").length,
    }
  }

  const counts = getCounts()

  return (
    <div className="space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Productos</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Gestiona los productos de tu tienda Shopify</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/products/new")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="sm:hidden">Nuevo</span>
          <span className="hidden sm:inline">Nuevo producto</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Catálogo de productos</CardTitle>
              <CardDescription className="text-sm">
                Visualiza, edita y crea nuevos productos para tu tienda online.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={syncProducts}
                disabled={isSyncing}
                variant="outline"
                className="border-yellow-300 hover:bg-yellow-50"
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span className="sm:hidden">Sync...</span>
                    <span className="hidden sm:inline">Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span className="sm:hidden">Sync</span>
                    <span className="hidden sm:inline">Sincronizar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Controles de búsqueda y filtros */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Ordenamiento */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="sm:hidden">Orden</span>
                      <span className="hidden sm:inline">{getSortTitle()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("title-asc")}>Nombre (A-Z)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title-desc")}>Nombre (Z-A)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("date-desc")}>Fecha (Reciente primero)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("date-asc")}>Fecha (Antiguo primero)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-asc")}>Precio (Menor primero)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-desc")}>Precio (Mayor primero)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Selector de vista */}
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("px-2 rounded-none", viewMode === "grid" && "bg-gray-100 dark:bg-gray-800")}
                    onClick={() => setViewMode("grid")}
                    aria-label="Vista de cuadrícula"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("px-2 rounded-none", viewMode === "list" && "bg-gray-100 dark:bg-gray-800")}
                    onClick={() => setViewMode("list")}
                    aria-label="Vista de lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Tabs responsivos */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="bg-muted/60 w-full justify-start mb-4 min-w-max">
                  <TabsTrigger value="all" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                    Todos
                    <Badge variant="outline" className="ml-2 bg-white/20">
                      {counts.all}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
                  >
                    Activos
                    <Badge variant="outline" className="ml-2 bg-white/20">
                      {counts.active}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="draft"
                    className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
                  >
                    Borradores
                    <Badge variant="outline" className="ml-2 bg-white/20">
                      {counts.draft}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
                  >
                    Archivados
                    <Badge variant="outline" className="ml-2 bg-white/20">
                      {counts.archived}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Contenido de las pestañas */}
              {["all", "active", "draft", "archived"].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="mt-0">
                  {isLoading ? (
                    viewMode === "grid" ? (
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
                    ) : (
                      <div className="space-y-2">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="flex items-center gap-4 border rounded-md p-4">
                              <Skeleton className="h-16 w-16 rounded-md" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                              </div>
                              <Skeleton className="h-8 w-24" />
                            </div>
                          ))}
                      </div>
                    )
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 border rounded-md bg-gray-50 dark:bg-gray-900">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold sm:text-xl">No se encontraron productos</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4 sm:text-base">
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
                        onClick={() => router.push("/dashboard/products/new")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nuevo producto
                      </Button>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/dashboard/products/${cleanId(product.id)}`}
                          className="flex items-center gap-4 border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <div className="h-16 w-16 relative bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                            {getImageUrl(product) ? (
                              <img
                                src={getImageUrl(product) || "/placeholder.svg"}
                                alt={product.title || "Producto"}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{product.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.productType || "Sin categoría"}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-medium">
                              {formatCurrency(product.price || 0, product.currencyCode || "EUR")}
                            </div>
                            <Badge
                              variant={product.status === "ACTIVE" ? "default" : "secondary"}
                              className={cn(
                                "text-xs",
                                product.status === "ACTIVE" &&
                                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                              )}
                            >
                              {product.status === "ACTIVE"
                                ? "Activo"
                                : product.status === "DRAFT"
                                  ? "Borrador"
                                  : "Archivado"}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
