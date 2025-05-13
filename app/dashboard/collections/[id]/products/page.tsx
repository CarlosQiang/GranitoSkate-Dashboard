"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCollectionById } from "@/lib/api/collections"
import { CollectionProductManager } from "@/components/collection-product-manager"
import { ArrowLeft, Package, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CollectionProductsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [collection, setCollection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("add")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true)
        setError(null)

        // Extract the numeric ID from the URL parameter
        const numericId = params.id.includes("/") ? params.id.split("/").pop() : params.id

        console.log("Intentando cargar colección con ID:", numericId)
        const data = await fetchCollectionById(numericId)
        console.log("Datos de colección recibidos:", data)
        setCollection(data)
      } catch (err) {
        console.error("Error al cargar la colección:", err)
        setError(`Error al cargar la colección: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [params.id, refreshKey])

  const handleComplete = () => {
    // Refrescar la colección para mostrar los cambios
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando información de la colección...</p>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar la colección</AlertTitle>
          <AlertDescription>{error || "No se pudo cargar la información de la colección."}</AlertDescription>
        </Alert>

        <Button onClick={() => setRefreshKey((prev) => prev + 1)}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Gestionar productos de la colección</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {collection.title}
          </CardTitle>
          <CardDescription>
            {collection.productsCount === 1
              ? "1 producto en esta colección"
              : `${collection.productsCount} productos en esta colección`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="add">Añadir productos</TabsTrigger>
              <TabsTrigger value="remove">Eliminar productos</TabsTrigger>
            </TabsList>
            <TabsContent value="add">
              <CollectionProductManager
                collectionId={params.id}
                onComplete={handleComplete}
                mode="add"
                key={`add-${refreshKey}`}
              />
            </TabsContent>
            <TabsContent value="remove">
              <CollectionProductManager
                collectionId={params.id}
                onComplete={handleComplete}
                mode="remove"
                key={`remove-${refreshKey}`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
