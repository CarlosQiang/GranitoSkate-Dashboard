"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { ProductsFilter } from "@/components/products-filter"
import { RefreshCw, Plus } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ProductsPageClient() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncStatus, setSyncStatus] = useState({ success: false, message: "" })
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Intentar obtener productos de la base de datos primero
      const dbResponse = await fetch("/api/db/productos")

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (dbData.success && dbData.data && dbData.data.length > 0) {
          setProducts(dbData.data)
          setFilteredProducts(dbData.data)
          return
        }
      }

      // Si no hay productos en la base de datos, obtenerlos de Shopify
      const response = await fetch("/api/shopify/products")

      if (!response.ok) {
        throw new Error("Error al cargar productos")
      }

      const data = await response.json()

      if (data.success && data.products) {
        console.log(`Se encontraron ${data.products.length} productos en Shopify`)
        setProducts(data.products)
        setFilteredProducts(data.products)
      } else {
        throw new Error(data.message || "Error al cargar productos")
      }
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(err.message || "Error desconocido al cargar productos")
    } finally {
      setIsLoading(false)
    }
  }

  const syncProducts = async () => {
    try {
      setIsSyncing(true)
      setSyncStatus({ success: false, message: "" })

      const response = await fetch("/api/sync/productos")

      if (!response.ok) {
        throw new Error("Error al sincronizar productos")
      }

      const data = await response.json()

      if (data.success) {
        setSyncStatus({
          success: true,
          message: data.message || `Productos sincronizados correctamente`,
        })

        // Actualizar la lista de productos
        if (data.data) {
          setProducts(data.data)
          setFilteredProducts(data.data)
        } else {
          // Si no hay datos en la respuesta, volver a cargar los productos
          await fetchProducts()
        }
      } else {
        throw new Error(data.message || "Error al sincronizar productos")
      }
    } catch (err) {
      console.error("Error al sincronizar productos:", err)
      setSyncStatus({
        success: false,
        message: err.message || "Error desconocido al sincronizar productos",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFilter = (filters) => {
    const { searchTerm, sortBy, status } = filters

    let filtered = [...products]

    // Aplicar filtro de estado
    if (status && status !== "all") {
      filtered = filtered.filter(
        (product) => (product.status || product.estado || "").toLowerCase() === status.toLowerCase(),
      )
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          (product.title || product.titulo || "").toLowerCase().includes(search) ||
          (product.sku || "").toLowerCase().includes(search) ||
          (product.product_type || product.tipo_producto || "").toLowerCase().includes(search) ||
          (product.vendor || product.proveedor || "").toLowerCase().includes(search),
      )
    }

    // Aplicar ordenamiento
    if (sortBy) {
      const [field, direction] = sortBy.split("-")

      filtered.sort((a, b) => {
        let valueA, valueB

        if (field === "title") {
          valueA = (a.title || a.titulo || "").toLowerCase()
          valueB = (b.title || b.titulo || "").toLowerCase()
        } else if (field === "price") {
          valueA = Number.parseFloat(a.price || a.precio || 0)
          valueB = Number.parseFloat(b.price || b.precio || 0)
        } else if (field === "inventory") {
          valueA = Number.parseInt(a.inventory || a.inventario || 0, 10)
          valueB = Number.parseInt(b.inventory || b.inventario || 0, 10)
        } else if (field === "updated") {
          valueA = new Date(a.updated_at || a.actualizado_en || 0).getTime()
          valueB = new Date(b.updated_at || b.actualizado_en || 0).getTime()
        }

        if (direction === "asc") {
          return valueA > valueB ? 1 : -1
        } else {
          return valueA < valueB ? 1 : -1
        }
      })
    }

    setFilteredProducts(filtered)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona los productos de tu tienda Shopify</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncProducts} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar productos"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      {syncStatus.message && (
        <Alert
          variant={syncStatus.success ? "default" : "destructive"}
          className={syncStatus.success ? "bg-green-50 border-green-200" : undefined}
        >
          {syncStatus.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{syncStatus.success ? "Sincronización exitosa" : "Error"}</AlertTitle>
          <AlertDescription>{syncStatus.message}</AlertDescription>
        </Alert>
      )}

      <ProductsFilter onFilter={handleFilter} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron productos. Crea un nuevo producto o sincroniza con Shopify.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.shopify_id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
