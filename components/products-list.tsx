"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function ProductsList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [error, setError] = useState(null)
  const [errorDetails, setErrorDetails] = useState(null)
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
    setError(null)
    setErrorDetails(null)

    try {
      // Primero intentamos obtener de la base de datos
      const dbResponse = await fetch("/api/db/productos")

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (dbData.success && dbData.data && dbData.data.length > 0) {
          setProducts(dbData.data)
          setFilteredProducts(dbData.data)
          setIsLoading(false)
          return
        }
      }

      // Si no hay datos en la base de datos, obtenemos directamente de Shopify
      const shopifyResponse = await fetch("/api/shopify/products")

      if (!shopifyResponse.ok) {
        let errorMessage = `Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`
        let errorDetailsData = null

        try {
          const errorData = await shopifyResponse.json()
          errorMessage = errorData.error || errorMessage
          errorDetailsData = errorData.details || null
        } catch (e) {
          // Si no podemos parsear el error, usamos el mensaje genérico
        }

        throw new Error(errorMessage, { cause: errorDetailsData })
      }

      const shopifyData = await shopifyResponse.json()

      if (!shopifyData.success) {
        throw new Error(shopifyData.error || "Error al cargar productos de Shopify")
      }

      const productsData = shopifyData.data || []

      // Verificar si hay productos
      if (productsData.length === 0) {
        console.log("No se encontraron productos en Shopify")
      } else {
        console.log(`Se encontraron ${productsData.length} productos en Shopify`)
      }

      setProducts(productsData)
      setFilteredProducts(productsData)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setError(error instanceof Error ? error.message : "Error al cargar productos")
      setErrorDetails(error instanceof Error ? error.cause : null)

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
    if (!products || products.length === 0) {
      setFilteredProducts([])
      return
    }

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const getActiveCount = () => {
    if (!products || products.length === 0) return 0
    return products.filter(
      (p) => p.estado === "ACTIVE" || p.estado === "active" || p.status === "ACTIVE" || p.status === "active",
    ).length
  }

  const getDraftCount = () => {
    if (!products || products.length === 0) return 0
    return products.filter(
      (p) => p.estado === "DRAFT" || p.estado === "draft" || p.status === "DRAFT" || p.status === "draft",
    ).length
  }

  const getArchivedCount = () => {
    if (!products || products.length === 0) return 0
    return products.filter(
      (p) => p.estado === "ARCHIVED" || p.estado === "archived" || p.status === "ARCHIVED" || p.status === "archived",
    ).length
  }

  const isShopifyCredentialsError = error && error.includes("Faltan credenciales de Shopify")

  return (
    <div className="space-y-4">
      <Card>
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
                    Todos ({products?.length || 0})
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
      ) : error ? (
        <div className="text-center p-8 border rounded-lg bg-background space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar productos</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {isShopifyCredentialsError && (
            <Alert variant="warning" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuración de Shopify incompleta</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Faltan variables de entorno necesarias para conectar con Shopify.</p>
                <Link href="/dashboard/configuracion" className="flex items-center gap-1 text-primary hover:underline">
                  <span>Ir a la página de configuración</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {errorDetails && (
            <div className="mt-4 text-left">
              <h3 className="text-sm font-medium mb-2">Detalles del error:</h3>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                {typeof errorDetails === "string" ? errorDetails : JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          )}

          <Button variant="outline" onClick={fetchProducts} className="flex items-center gap-2 mt-4">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-background">
          <p className="text-muted-foreground mb-4">No se encontraron productos</p>
          <Button variant="outline" onClick={fetchProducts} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
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
