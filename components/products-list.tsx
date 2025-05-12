"use client"

import { useState, useEffect } from "react"
import { fetchProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, AlertCircle, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShopifyApiStatus } from "@/components/shopify-api-status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { checkShopifyEnvVars as checkEnvVars } from "@/lib/shopify"
import Link from "next/link"

export function ProductsList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingSampleData, setUsingSampleData] = useState(false)
  const [envStatus, setEnvStatus] = useState({ isValid: false, missingVars: [] })

  const loadProducts = async (useSampleData = false) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar variables de entorno
      const envCheck = checkEnvVars()
      setEnvStatus(envCheck)

      // Intentar cargar productos con hasta 3 reintentos
      let attempts = 0
      let success = false
      let data = []

      while (attempts < 3 && !success) {
        try {
          data = await fetchProducts({ limit: 50, useSampleData: useSampleData || !envCheck.isValid })
          success = true
          setUsingSampleData(useSampleData || !envCheck.isValid)
        } catch (err) {
          console.warn(`Intento ${attempts + 1} fallido:`, err)
          attempts++
          if (attempts < 3) {
            // Esperar antes de reintentar
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            throw err
          }
        }
      }

      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(err.message || "Error al cargar productos")

      // Si hay un error, intentar cargar datos de muestra
      try {
        const sampleData = await fetchProducts({ limit: 50, useSampleData: true })
        setProducts(sampleData)
        setFilteredProducts(sampleData)
        setUsingSampleData(true)
      } catch (sampleErr) {
        console.error("Error al cargar datos de muestra:", sampleErr)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    // Filtrar productos por término de búsqueda y estado
    const filtered = products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productType?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || product.status === statusFilter

      return matchesSearch && matchesStatus
    })

    setFilteredProducts(filtered)
  }, [searchTerm, statusFilter, products])

  const renderEnvironmentWarning = () => {
    if (envStatus.isValid || !envStatus.missingVars.length) return null

    return (
      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Variables de entorno faltantes</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Faltan las siguientes variables de entorno necesarias para conectar con Shopify:</p>
          <ul className="list-disc pl-5">
            {envStatus.missingVars.map((variable) => (
              <li key={variable}>{variable}</li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurar variables
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadProducts(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Usar datos de muestra
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <ShopifyApiStatus />
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ShopifyApiStatus />

      {renderEnvironmentWarning()}

      {usingSampleData && !error && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Usando datos de muestra</AlertTitle>
          <AlertDescription>
            Se están mostrando datos de muestra porque no hay conexión con Shopify.
            <Button variant="outline" size="sm" onClick={() => loadProducts(false)} className="ml-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar conectar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar productos</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadProducts(false)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadProducts(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Usar datos de muestra
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
