"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchCollections, deleteCollection } from "@/lib/api/collections"
import { CollectionCard } from "@/components/collection-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, AlertTriangle, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState(null)
  const { toast } = useToast()
  const router = useRouter()

  const loadCollections = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchCollections(50)
      console.log("Collections loaded:", data)
      setCollections(data)
      setFilteredCollections(data)
    } catch (err) {
      console.error("Error al cargar colecciones:", err)
      setError(err.message || "No se pudieron cargar las colecciones")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCollections(collections)
    } else {
      const filtered = collections.filter((collection) =>
        collection.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCollections(filtered)
    }
  }, [searchTerm, collections])

  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      await deleteCollection(id)

      // Actualizar la lista de colecciones
      setCollections(collections.filter((collection) => collection.id !== id))

      toast({
        title: "Colección eliminada",
        description: "La colección ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar la colección:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar la colección: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-muted/30 p-4 rounded-lg animate-pulse">
          <div className="h-10 w-full bg-muted rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 animate-pulse">
              <div className="aspect-square bg-muted rounded-md mb-4"></div>
              <div className="h-6 bg-muted rounded-md mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={loadCollections}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar colecciones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={loadCollections} title="Actualizar">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Actualizar</span>
        </Button>
        <Button asChild>
          <Link href="/dashboard/collections/new">
            <Plus className="h-4 w-4 mr-1" />
            Nueva colección
          </Link>
        </Button>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron colecciones</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/collections/new">
              <Plus className="h-4 w-4 mr-1" />
              Crear colección
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  )
}
