"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Package } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/shopify/collections")

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        const data = await response.json()
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
        </Card>
      ))}
    </div>
  )
}
