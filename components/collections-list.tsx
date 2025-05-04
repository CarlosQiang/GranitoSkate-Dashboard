"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { fetchCollections, deleteCollection } from "@/lib/api/collections"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Package, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export function CollectionsList() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const { toast } = useToast()
  const router = useRouter()

  const loadCollections = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCollections()
      console.log("Collections loaded:", data)
      setCollections(data)
    } catch (err) {
      console.error("Error al cargar colecciones:", err)
      setError(err.message || "No se pudieron cargar las colecciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-medium">Error al cargar las colecciones</p>
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={loadCollections}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No hay colecciones</h3>
        <p className="text-muted-foreground mb-4">Crea tu primera colección para organizar tus productos</p>
        <Button asChild>
          <Link href="/dashboard/collections/new">Crear colección</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <Card key={collection.id} className="overflow-hidden">
          <div className="relative h-48 bg-gray-100">
            {collection.image ? (
              <Image
                src={collection.image.url || "/placeholder.svg"}
                alt={collection.image.altText || collection.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Package size={48} />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-1">{collection.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {collection.productsCount} productos
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/collections/${collection.id.split("/").pop()}`}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/collections/${collection.id.split("/").pop()}/products`}>
                  <Package className="h-4 w-4 mr-1" />
                  Productos
                </Link>
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar colección?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La colección será eliminada permanentemente, pero los productos no
                    se eliminarán.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(collection.id)}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={deletingId === collection.id}
                  >
                    {deletingId === collection.id ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
