"use client"

import { useState, useEffect } from "react"
import { fetchCollections } from "@/lib/api/collections"
import { CollectionCard } from "@/components/collection-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShopifyApiStatus } from "@/components/shopify-api-status"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCollections = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCollections({ limit: 50 })
      setCollections(data)
      setFilteredCollections(data)
    } catch (err) {
      console.error("Error al cargar colecciones:", err)
      setError(err.message || "Error al cargar colecciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCollections(collections)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = collections.filter(
        (collection) =>
          collection.title.toLowerCase().includes(term) || collection.description.toLowerCase().includes(term),
      )
      setFilteredCollections(filtered)
    }
  }, [searchTerm, collections])

  if (error) {
    return (
      <div className="space-y-4">
        <ShopifyApiStatus />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar colecciones</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadCollections} className="w-fit">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
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

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar colecciones..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron colecciones</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  )
}
