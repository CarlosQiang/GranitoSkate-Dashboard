"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Package, Edit } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      setError(null)

      // Primero intentamos obtener de la base de datos
      const dbResponse = await fetch("/api/db/colecciones")

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (dbData.success && dbData.data && dbData.data.length > 0) {
          console.log("Colecciones cargadas desde la base de datos:", dbData.data.length)
          setCollections(dbData.data)
          setLoading(false)
          return
        }
      }

      // Si no hay datos en la base de datos, obtenemos directamente de Shopify
      const shopifyResponse = await fetch("/api/shopify/collections")

      if (!shopifyResponse.ok) {
        throw new Error(`Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`)
      }

      const shopifyData = await shopifyResponse.json()

      if (!shopifyData.success) {
        throw new Error(shopifyData.error || "Error al cargar colecciones de Shopify")
      }

      const collectionsData = shopifyData.data || []

      // Verificar si hay colecciones
      if (collectionsData.length === 0) {
        console.log("No se encontraron colecciones en Shopify")
      } else {
        console.log(`Se encontraron ${collectionsData.length} colecciones en Shopify`)
      }

      setCollections(collectionsData)
    } catch (err) {
      console.error("Error loading collections:", err)
      setError(err.message || "Error al cargar las colecciones")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando colecciones...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error al cargar las colecciones</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" onClick={loadCollections}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold">No hay colecciones</h3>
        <p className="mt-1 text-gray-500">Comienza creando tu primera colección.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/collections/new">Crear colección</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <Card key={collection.id} className="overflow-hidden h-full flex flex-col">
          <div className="aspect-video relative bg-gray-100">
            {collection.image || collection.imagen_url ? (
              <img
                src={collection.image || collection.imagen_url}
                alt={collection.title || collection.titulo}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <CardContent className="p-4 flex-grow">
            <h3 className="text-lg font-semibold line-clamp-1">{collection.title || collection.titulo}</h3>
            <p className="text-sm text-gray-500">
              {collection.products_count || collection.productos_count || 0} productos
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/dashboard/collections/${collection.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/dashboard/collections/${collection.id}/products`}>
                <Package className="mr-2 h-4 w-4" />
                Productos
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
