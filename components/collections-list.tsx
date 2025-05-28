"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Package } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchCollections } from "@/lib/api/collections"
import { LoadingState } from "@/components/loading-state"
import { CollectionsFilters, type CollectionFilters } from "./collections-filters"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState<CollectionFilters>({
    search: "",
    productSearch: "",
    sortBy: "name",
    sortOrder: "asc",
    hasProducts: "all",
    productCountRange: { min: null, max: null },
    status: "all",
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true)
        const data = await fetchCollections()
        setCollections(data)
        setError(null)
      } catch (err) {
        console.error("Error loading collections:", err)
        setError(err.message || "Error al cargar las colecciones")
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  // Función para filtrar y ordenar colecciones
  const filteredAndSortedCollections = useMemo(() => {
    let filtered = [...collections]

    // Filtro por búsqueda de nombre de colección
    if (filters.search) {
      filtered = filtered.filter(
        (collection) =>
          collection.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          collection.description?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    // Filtro por búsqueda de producto
    if (filters.productSearch) {
      filtered = filtered.filter((collection) =>
        collection.products?.edges?.some((edge) =>
          edge.node.title.toLowerCase().includes(filters.productSearch.toLowerCase()),
        ),
      )
    }

    // Filtro por productos
    if (filters.hasProducts === "with") {
      filtered = filtered.filter((collection) => collection.productsCount > 0)
    } else if (filters.hasProducts === "without") {
      filtered = filtered.filter((collection) => collection.productsCount === 0)
    }

    // Filtro por rango de productos
    if (filters.productCountRange.min !== null) {
      filtered = filtered.filter((collection) => collection.productsCount >= filters.productCountRange.min)
    }
    if (filters.productCountRange.max !== null) {
      filtered = filtered.filter((collection) => collection.productsCount <= filters.productCountRange.max)
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title)
          break
        case "products":
          comparison = a.productsCount - b.productsCount
          break
        case "created":
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          break
        case "updated":
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
          break
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [collections, filters])

  if (loading) {
    return <LoadingState message="Cargando colecciones..." />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Error al cargar las colecciones</h3>
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <CollectionsFilters
        onFiltersChange={setFilters}
        totalCollections={collections.length}
        filteredCount={filteredAndSortedCollections.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Lista de colecciones */}
      {filteredAndSortedCollections.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold">
            {collections.length === 0 ? "No hay colecciones" : "No se encontraron colecciones"}
          </h3>
          <p className="mt-1 text-gray-500">
            {collections.length === 0
              ? "Comienza creando tu primera colección."
              : "Intenta ajustar los filtros de búsqueda."}
          </p>
          {collections.length === 0 && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/collections/new">Crear colección</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredAndSortedCollections.map((collection) => (
            <Card key={collection.id} className={`overflow-hidden ${viewMode === "list" ? "flex" : "h-full flex-col"}`}>
              {viewMode === "grid" ? (
                <>
                  <div className="aspect-video relative bg-gray-100">
                    {collection.image ? (
                      <Image
                        src={collection.image.url || "/placeholder.svg"}
                        alt={collection.image.altText || collection.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="text-lg font-semibold line-clamp-1">{collection.title}</h3>
                    <p className="text-sm text-gray-500">{collection.productsCount} productos</p>
                    {collection.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{collection.description}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0 border-t">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/collections/${collection.id.split("/").pop()}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/collections/${collection.id.split("/").pop()}/products`}>
                        <Package className="mr-2 h-4 w-4" />
                        Productos
                      </Link>
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                    {collection.image ? (
                      <Image
                        src={collection.image.url || "/placeholder.svg"}
                        alt={collection.image.altText || collection.title}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{collection.title}</h3>
                        <p className="text-sm text-gray-500">{collection.productsCount} productos</p>
                        {collection.description && (
                          <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/collections/${collection.id.split("/").pop()}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/collections/${collection.id.split("/").pop()}/products`}>
                            <Package className="mr-2 h-4 w-4" />
                            Productos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
