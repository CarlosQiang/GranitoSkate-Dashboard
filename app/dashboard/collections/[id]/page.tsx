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
import { fetchCollectionById, updateCollection } from "@/lib/api/collections"
import { ArrowLeft, Save, Tags } from "lucide-react"

export default function CollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [collection, setCollection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    seo: {
      title: "",
      description: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionData = await fetchCollectionById(params.id)
        setCollection(collectionData)
        setFormData({
          title: collectionData.title,
          description: collectionData.description || "",
          seo: {
            title: collectionData.seo?.title || collectionData.title,
            description: collectionData.seo?.description || "",
          },
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la colección",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1]
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          [seoField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateCollection(params.id, {
        title: formData.title,
        descriptionHtml: formData.description,
        metafields: [
          {
            namespace: "seo",
            key: "title",
            value: formData.seo.title,
            type: "single_line_text_field",
          },
          {
            namespace: "seo",
            key: "description",
            value: formData.seo.description,
            type: "multi_line_text_field",
          },
        ],
      })

      toast({
        title: "Colección actualizada",
        description: "La colección ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error updating collection:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la colección",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
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
                <Label htmlFor="title">Nombre de la colección</Label>
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
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos en esta colección</CardTitle>
              <CardDescription>Productos que pertenecen a esta colección</CardDescription>
            </CardHeader>
            <CardContent>
              {collection.products?.edges.length > 0 ? (
                <div className="space-y-4">
                  {collection.products.edges.map((edge: any) => (
                    <div key={edge.node.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                          {edge.node.featuredImage ? (
                            <Image
                              src={edge.node.featuredImage.url || "/placeholder.svg"}
                              alt={edge.node.title}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <Tags className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{edge.node.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {edge.node.status} • Stock: {edge.node.totalInventory}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/dashboard/products/${edge.node.id.split("/").pop()}`}>Ver</a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">Esta colección no tiene productos asignados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimización para motores de búsqueda</CardTitle>
              <CardDescription>Mejora la visibilidad de tu colección en los resultados de búsqueda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Título SEO</Label>
                <Input
                  id="seo-title"
                  name="seo.title"
                  value={formData.seo.title}
                  onChange={handleInputChange}
                  placeholder="Título para motores de búsqueda"
                />
                <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">Descripción SEO</Label>
                <Textarea
                  id="seo-description"
                  name="seo.description"
                  value={formData.seo.description}
                  onChange={handleInputChange}
                  placeholder="Descripción para motores de búsqueda"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
