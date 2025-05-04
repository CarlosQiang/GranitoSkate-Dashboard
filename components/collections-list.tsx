"use client"

import { useEffect, useState } from "react"
import { RefreshCw, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CollectionCard } from "@/components/collection-card"
import { fetchCollections } from "@/lib/api/collections"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCollections = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCollections()
      setCollections(data)
    } catch (err) {
      console.error("Error al cargar colecciones:", err)
      setError("No se pudieron cargar las colecciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Cargando colecciones...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={loadCollections}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </Card>
    )
  }

  if (collections.length === 0) {
    return (
      <Card className="p-6 text-center">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No hay colecciones disponibles</p>
        <Button asChild>
          <a href="/dashboard/collections/new">Crear primera colección</a>
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  )
}
