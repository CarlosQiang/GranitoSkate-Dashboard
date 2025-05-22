"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CollectionCard } from "@/components/collection-card"
import { CollectionsFilter } from "@/components/collections-filter"
import { RefreshCw, Plus } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncStatus, setSyncStatus] = useState({ success: false, message: "" })
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchCollections = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Intentar obtener colecciones de la base de datos primero
      const dbResponse = await fetch("/api/db/colecciones")

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (dbData.success && dbData.data && dbData.data.length > 0) {
          setCollections(dbData.data)
          setFilteredCollections(dbData.data)
          return
        }
      }

      // Si no hay colecciones en la base de datos, obtenerlas de Shopify
      const response = await fetch("/api/shopify/collections")

      if (!response.ok) {
        throw new Error("Error al cargar colecciones")
      }

      const data = await response.json()

      if (data.success && data.collections) {
        console.log(`Se encontraron ${data.collections.length} colecciones en Shopify`)
        setCollections(data.collections)
        setFilteredCollections(data.collections)
      } else {
        throw new Error(data.message || "Error al cargar colecciones")
      }
    } catch (err) {
      console.error("Error al cargar colecciones:", err)
      setError(err.message || "Error desconocido al cargar colecciones")
    } finally {
      setIsLoading(false)
    }
  }

  const syncCollections = async () => {
    try {
      setIsSyncing(true)
      setSyncStatus({ success: false, message: "" })

      const response = await fetch("/api/sync/colecciones")

      if (!response.ok) {
        throw new Error("Error al sincronizar colecciones")
      }

      const data = await response.json()

      if (data.success) {
        setSyncStatus({
          success: true,
          message: data.message || `${data.count} colecciones sincronizadas correctamente`,
        })

        // Actualizar la lista de colecciones
        if (data.data) {
          setCollections(data.data)
          setFilteredCollections(data.data)
        } else {
          // Si no hay datos en la respuesta, volver a cargar las colecciones
          await fetchCollections()
        }
      } else {
        throw new Error(data.message || "Error al sincronizar colecciones")
      }
    } catch (err) {
      console.error("Error al sincronizar colecciones:", err)
      setSyncStatus({
        success: false,
        message: err.message || "Error desconocido al sincronizar colecciones",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFilter = (filters) => {
    const { searchTerm, sortBy } = filters

    let filtered = [...collections]

    // Aplicar búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (collection) =>
          collection.title?.toLowerCase().includes(search) || collection.titulo?.toLowerCase().includes(search),
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
        } else if (field === "products") {
          valueA = a.productsCount || a.productos_count || 0
          valueB = b.productsCount || b.productos_count || 0
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

    setFilteredCollections(filtered)
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
          <p className="text-muted-foreground">Gestiona las colecciones de tu tienda Shopify</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncCollections} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar colecciones"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva colección
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

      <CollectionsFilter onFilter={handleFilter} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron colecciones. Crea una nueva colección o sincroniza con Shopify.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Mostrando {filteredCollections.length} de {collections.length} colecciones
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <CollectionCard key={collection.id || collection.shopify_id} collection={collection} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
