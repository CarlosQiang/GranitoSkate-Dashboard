"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { fetchCollections, deleteCollection } from "@/lib/api/collections"
import { useToast } from "@/components/ui/use-toast"
import { LoadingState } from "@/components/loading-state"
import { CollectionCard } from "@/components/collection-card"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true)
        const data = await fetchCollections()
        // Extraer los nodos de las colecciones
        const collectionNodes = data.edges.map((edge) => edge.node)
        setCollections(collectionNodes)
        setError(null)
      } catch (err) {
        console.error("Error al cargar colecciones:", err)
        setError(err.message || "Error al cargar colecciones")
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error al cargar colecciones",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [toast])

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta colección?")) {
      try {
        await deleteCollection(id)
        setCollections(collections.filter((collection) => collection.id !== id))
        toast({
          title: "Colección eliminada",
          description: "La colección ha sido eliminada correctamente",
        })
      } catch (err) {
        console.error("Error al eliminar colección:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error al eliminar la colección",
        })
      }
    }
  }

  if (loading) {
    return <LoadingState message="Cargando colecciones..." />
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <h3 className="font-bold">Error al cargar las colecciones</h3>
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No hay colecciones disponibles</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard/collections/new">Crear colección</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          actions={
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/dashboard/collections/${collection.id.split("/").pop()}/products`}>
                  <Package className="mr-2 h-4 w-4" />
                  Productos
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/dashboard/collections/${collection.id.split("/").pop()}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(collection.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </>
          }
        />
      ))}
    </div>
  )
}
