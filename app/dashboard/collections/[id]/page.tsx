"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchCollectionById, updateCollection, deleteCollection } from "@/lib/api/collections"
import { ArrowLeft, Save, Tags, AlertTriangle, RefreshCw, AlertCircle, Plus, Trash2, Package } from "lucide-react"
import { generateSeoMetafields } from "@/lib/seo-utils"
import { SeoPreview } from "@/components/seo-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { CollectionSeoForm } from "@/components/collection-seo-form"

export default function CollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [collection, setCollection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const fetchCollectionData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Intentando cargar colección con ID: ${params.id}`)
      const collectionData = await fetchCollectionById(params.id)

      if (!collectionData) {
        throw new Error("No se pudo encontrar la colección")
      }

      console.log("Datos de colección recibidos:", collectionData)
      setCollection(collectionData)

      setFormData({
        title: collectionData.title || "",
        description: collectionData.description || "",
      })
    } catch (error) {
      console.error("Error fetching collection data:", error)
      setError(`No se pudo cargar la información de la colección: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la colección",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollectionData()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const updateData = {
        title: formData.title,
        descriptionHtml: formData.description,
        // Generar automáticamente los metafields de SEO
        metafields: generateSeoMetafields(formData.title, formData.description),
      }

      console.log("Enviando datos para actualizar colección:", updateData)
      await updateCollection(params.id, updateData)

      toast({
        title: "¡Colección actualizada!",
        description: "Los cambios se han guardado y optimizado para buscadores",
      })

      // Recargar los datos de la colección
      fetchCollectionData()
    } catch (error) {
      console.error("Error updating collection:", error)
      setError(`No se pudo actualizar la colección: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: `No se pudo actualizar la colección: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCollection(params.id)
      toast({
        title: "Colección eliminada",
        description: "La colección ha sido eliminada correctamente",
      })
      router.push("/dashboard/collections")
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar la colección: ${(error as Error).message}`,
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error al cargar la colección</CardTitle>
            </div>
            <CardDescription>
              No se pudo cargar la información de la colección. Es posible que la colección haya sido eliminada o que no
              tengas permisos para acceder a ella.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/collections")}>
                Volver a colecciones
              </Button>
              <Button onClick={fetchCollectionData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente la colección.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Posicionamiento automático</AlertTitle>
        <AlertDescription className="text-blue-700">
          No te preocupes por el SEO. Tu colección se optimizará automáticamente para aparecer en Google usando el
          nombre y la descripción que escribas.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Información básica</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="aspect-square rounded-md overflow-hidden bg-muted mb-4">
                {collection.image ? (
                  <Image
                    src={collection.image.url || "/placeholder.svg"}
                    alt={collection.title}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Tags className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Nombre de la colección <span className="text-red-500">*</span>
                </Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={8}
                />
              </div>
            </div>
          </div>

          {/* Vista previa de Google */}
          <SeoPreview title={formData.title} description={formData.description} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Productos en esta colección</CardTitle>
                <CardDescription>Productos que pertenecen a esta colección</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/collections/${params.id}/products`)}
              >
                Gestionar productos
              </Button>
            </CardHeader>
            <CardContent>
              {collection.products?.edges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {collection.products.edges.map((edge: any) => (
                    <div key={edge.node.id} className="border rounded-md overflow-hidden">
                      <div className="aspect-square relative">
                        {edge.node.featuredImage ? (
                          <Image
                            src={edge.node.featuredImage.url || "/placeholder.svg"}
                            alt={edge.node.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate">{edge.node.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              edge.node.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {edge.node.status === "ACTIVE" ? "Visible" : "Oculto"}
                          </span>
                          <Button variant="ghost" size="sm" asChild className="ml-auto">
                            <a href={`/dashboard/products/${edge.node.id.split("/").pop()}`}>Ver</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Esta colección no tiene productos asignados</p>
                  <Button onClick={() => router.push(`/dashboard/collections/${params.id}/products`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir productos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <CollectionSeoForm
            collectionId={params.id}
            collectionTitle={formData.title}
            collectionDescription={formData.description}
            collectionImage={collection.image?.url}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
