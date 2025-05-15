"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Package, RefreshCw, AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchCollections } from "@/lib/api/collections"
import { LoadingState } from "@/components/loading-state"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CollectionsList() {
  const { toast } = useToast()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadCollections = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Iniciando carga de colecciones...")
      const data = await fetchCollections()
      console.log("Colecciones cargadas:", data)

      if (!data) {
        throw new Error("No se recibieron datos de colecciones")
      }

      if (!Array.isArray(data)) {
        console.error("Formato de datos inválido:", data)
        throw new Error("Formato de datos inválido")
      }

      setCollections(data)

      if (data.length === 0 && retryCount < 2) {
        // Si no hay colecciones y no hemos intentado demasiadas veces, intentar de nuevo
        console.log(`No se encontraron colecciones. Reintentando (${retryCount + 1}/3)...`)
        setRetryCount((prev) => prev + 1)
        setTimeout(loadCollections, 2000) // Esperar 2 segundos antes de reintentar
      }
    } catch (err) {
      console.error("Error loading collections:", err)
      setError(err.message || "Error al cargar las colecciones")
      toast({
        title: "Error",
        description: "No se pudieron cargar las colecciones. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  const handleRetry = () => {
    setRetryCount(0)
    loadCollections()
  }

  const handleSyncCollections = async () => {
    try {
      setLoading(true)
      toast({
        title: "Sincronizando",
        description: "Sincronizando colecciones con Shopify...",
      })

      // Llamar al endpoint de sincronización
      const response = await fetch("/api/sync/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force: true }),
      })

      if (!response.ok) {
        throw new Error(`Error de sincronización: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      toast({
        title: "Sincronización completada",
        description: `Se sincronizaron ${result.count || 0} colecciones.`,
      })

      // Recargar colecciones
      loadCollections()
    } catch (err) {
      console.error("Error syncing collections:", err)
      toast({
        title: "Error de sincronización",
        description: err.message || "Error al sincronizar colecciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Cargando colecciones..." />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>

          <Button variant="default" onClick={handleSyncCollections}>
            Sincronizar con Shopify
          </Button>
        </div>
      </div>
    )
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center p-8 border border-dashed rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold">No hay colecciones</h3>
          <p className="mt-1 text-gray-500">Comienza creando tu primera colección o sincroniza con Shopify.</p>

          <div className="flex justify-center gap-2 mt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/collections/new">Crear colección</Link>
            </Button>

            <Button onClick={handleSyncCollections}>Sincronizar con Shopify</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
              <p className="text-sm text-gray-500">
                {typeof collection.productsCount === "number"
                  ? `${collection.productsCount} productos`
                  : collection.products?.length
                    ? `${collection.products.length} productos`
                    : "0 productos"}
              </p>
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
    </div>
  )
}
