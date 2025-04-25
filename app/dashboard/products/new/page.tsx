"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/api/products"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    vendor: "GranitoSkate",
    productType: "SKATEBOARD",
    variants: [
      {
        price: "",
        compareAtPrice: "",
        sku: "",
        title: "Default",
      },
    ],
    seo: {
      title: "",
      description: "",
    },
  })

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
    } else if (name.startsWith("variants[0].")) {
      const variantField = name.split(".")[1]
      const updatedVariants = [...formData.variants]
      updatedVariants[0] = {
        ...updatedVariants[0],
        [variantField]: value,
      }
      setFormData({
        ...formData,
        variants: updatedVariants,
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
      // Preparar los datos para la API de Shopify
      const productData = {
        title: formData.title,
        descriptionHtml: formData.description,
        status: formData.status,
        vendor: formData.vendor,
        productType: formData.productType,
        variants: [
          {
            price: formData.variants[0].price || "0.00",
            compareAtPrice: formData.variants[0].compareAtPrice || null,
            sku: formData.variants[0].sku || "",
            title: formData.variants[0].title || "Default Title",
          },
        ],
        metafields: [
          {
            namespace: "seo",
            key: "title",
            value: formData.seo.title || formData.title,
            type: "single_line_text_field",
          },
          {
            namespace: "seo",
            key: "description",
            value: formData.seo.description || "",
            type: "multi_line_text_field",
          },
        ],
      }

      console.log("Enviando datos para crear producto:", productData)
      const product = await createProduct(productData)
      console.log("Producto creado:", product)

      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente",
      })

      router.push(`/dashboard/products/${product.id.split("/").pop()}`)
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: `No se pudo crear el producto: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo producto</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del producto</CardTitle>
              <CardDescription>Información básica sobre el producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre del producto</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del producto"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Fabricante</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Fabricante"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de producto</Label>
                  <Input
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    placeholder="Tipo de producto"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="status" checked={formData.status === "ACTIVE"} onCheckedChange={handleStatusChange} />
                <Label htmlFor="status">{formData.status === "ACTIVE" ? "Activo" : "Borrador"}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variante predeterminada</CardTitle>
              <CardDescription>Configura la variante predeterminada del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    name="variants[0].price"
                    type="number"
                    step="0.01"
                    value={formData.variants[0].price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
                  <Input
                    id="compareAtPrice"
                    name="variants[0].compareAtPrice"
                    type="number"
                    step="0.01"
                    value={formData.variants[0].compareAtPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (opcional)</Label>
                  <Input
                    id="sku"
                    name="variants[0].sku"
                    value={formData.variants[0].sku}
                    onChange={handleInputChange}
                    placeholder="SKU"
                  />
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Nota: El inventario se configurará automáticamente después de crear el producto para evitar errores
                  con las ubicaciones.
                </p>
              </div>
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  )
}
