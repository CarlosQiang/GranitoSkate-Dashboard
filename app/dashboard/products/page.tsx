"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductsList } from "@/components/products-list"
import { fetchProducts } from "@/lib/api/products"
import { Suspense } from "react"
import Link from "next/link"
import { SyncProductsButton } from "@/components/sync-products-button"

// Marcar la página como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"
export const revalidate = 0

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
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
          <div className="flex items-center gap-2">
            <SyncProductsButton />
            <Button asChild>
              <Link href="/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo producto
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Gestiona los productos de tu tienda</h3>
          <p className="text-gray-500 mb-6">Visualiza, edita y crea nuevos productos para tu tienda online.</p>

          <Suspense fallback={<div>Cargando productos...</div>}>
            <ProductsList products={filteredProducts} onRefresh={loadProducts} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
