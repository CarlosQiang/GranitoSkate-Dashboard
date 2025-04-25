"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchProductById, updateProduct } from "@/lib/api/products"
import { fetchCollections } from "@/lib/api/collections"
import { Package, ArrowLeft, Save } from "lucide-react"

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    seo: {
      title: "",
      description: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await fetchProductById(params.id)
        setProduct(productData)
        setFormData({
          title: productData.title,
          description: productData.description,
          status: productData.status,
          seo: {
            title: productData.seo?.title || productData.title,
            description: productData.seo?.description || "",
          },
        })

        const collectionsData = await fetchCollections()
        setCollections(collectionsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del producto",
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

  const handleStatusChange = (checked: boolean) => {
    setFormData({
      ...formData,
      status: checked ? "ACTIVE" : "DRAFT",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateProduct(params.id, {
        title: formData.title,
        descriptionHtml: formData.description,
        status: formData.status,
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
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
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
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="aspect-square rounded-md overflow-hidden bg-muted mb-4">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url || "/placeholder.svg"}
                    alt={product.title}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Switch id="status" checked={formData.status === "ACTIVE"} onCheckedChange={handleStatusChange} />
                <Label htmlFor="status">{formData.status === "ACTIVE" ? "Activo" : "Borrador"}</Label>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Colecciones</CardTitle>
                    <CardDescription>Colecciones a las que pertenece este producto</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/products/${params.id}/collections`)}
                  >
                    Gestionar colecciones
                  </Button>
                </CardHeader>
                <CardContent>
                  {product.collections?.edges.length > 0 ? (
                    <ul className="space-y-2">
                      {product.collections.edges.map((edge: any) => (
                        <li key={edge.node.id} className="flex items-center justify-between">
                          <span>{edge.node.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Este producto no pertenece a ninguna colección</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre del producto</Label>
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

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimización para motores de búsqueda</CardTitle>
              <CardDescription>Mejora la visibilidad de tu producto en los resultados de búsqueda</CardDescription>
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

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del producto</CardTitle>
              <CardDescription>Gestiona las imágenes de tu producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images?.edges.map((edge: any) => (
                  <div key={edge.node.id} className="aspect-square rounded-md overflow-hidden bg-muted">
                    <Image
                      src={edge.node.url || "/placeholder.svg"}
                      alt={edge.node.altText || product.title}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle>Variantes del producto</CardTitle>
              <CardDescription>Gestiona las variantes de tu producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.variants?.edges.map((edge: any) => (
                  <div key={edge.node.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">{edge.node.title}</p>
                      <p className="text-sm text-muted-foreground">SKU: {edge.node.sku || "No definido"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: edge.node.price.currencyCode,
                        }).format(Number.parseFloat(edge.node.price.amount))}
                      </p>
                      <p className="text-sm text-muted-foreground">Stock: {edge.node.inventoryQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
