"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/api/products"
import { generateSeoMetafields, generateSeoHandle } from "@/lib/seo-utils"
import { SeoPreview } from "@/components/seo-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [productImage, setProductImage] = useState(null)
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
    inventoryQuantity: 0, // Movido fuera de variants
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("variants[0].")) {
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
    } else if (name === "inventoryQuantity") {
      // Manejar el inventario separadamente
      setFormData({
        ...formData,
        inventoryQuantity: value ? Number.parseInt(value, 10) : 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleStatusChange = (checked) => {
    setFormData({
      ...formData,
      status: checked ? "ACTIVE" : "DRAFT",
    })
  }

  const handleImageChange = (imageData) => {
    setProductImage(imageData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Generar handle SEO-friendly
      const handle = generateSeoHandle(formData.title)

      // Preparar los datos para la API de Shopify
      const productData = {
        title: formData.title,
        description: formData.description,
        handle: handle,
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
        // Añadir la cantidad de inventario separadamente
        inventoryQuantity: formData.inventoryQuantity,
        // Añadir la imagen si existe
        image: productImage,
        // Generar automáticamente los metafields de SEO
        metafields: generateSeoMetafields(formData.title, formData.description),
      }

      console.log("Enviando datos para crear producto:", productData)
      const product = await createProduct(productData)
      console.log("Producto creado:", product)

      toast({
        title: "¡Producto creado!",
        description: "Tu producto ya está disponible en la tienda y optimizado para buscadores",
      })

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: `No se pudo crear el producto: ${error.message}`,
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
        <Button onClick={handleSubmit} disabled={isSaving || !formData.title || !formData.variants[0].price}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Posicionamiento automático</AlertTitle>
        <AlertDescription className="text-blue-700">
          No te preocupes por el SEO. Tu producto se optimizará automáticamente para aparecer en Google usando el nombre
          y la descripción que escribas.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Información básica</TabsTrigger>
          <TabsTrigger value="variants">Precio y stock</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del producto</CardTitle>
              <CardDescription>Datos principales de tu producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Nombre del producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Tabla completa Element 8.0"
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
                  placeholder="Describe tu producto con detalle para que tus clientes lo conozcan mejor"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Marca</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Ej: Element, Santa Cruz, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de producto</Label>
                  <Input
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    placeholder="Ej: Tabla, Ruedas, Trucks, etc."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="status" checked={formData.status === "ACTIVE"} onCheckedChange={handleStatusChange} />
                <Label htmlFor="status">
                  {formData.status === "ACTIVE" ? "Visible en tienda" : "Oculto (borrador)"}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Vista previa de Google */}
          {formData.title && <SeoPreview title={formData.title} description={formData.description} />}
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Precio y disponibilidad</CardTitle>
              <CardDescription>Configura el precio y stock de tu producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Precio <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">€</span>
                    <Input
                      id="price"
                      name="variants[0].price"
                      type="number"
                      step="0.01"
                      value={formData.variants[0].price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Precio anterior (para ofertas)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">€</span>
                    <Input
                      id="compareAtPrice"
                      name="variants[0].compareAtPrice"
                      type="number"
                      step="0.01"
                      value={formData.variants[0].compareAtPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">Código de referencia (SKU)</Label>
                  <Input
                    id="sku"
                    name="variants[0].sku"
                    value={formData.variants[0].sku}
                    onChange={handleInputChange}
                    placeholder="Ej: GS-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryQuantity">Cantidad en stock</Label>
                  <Input
                    id="inventoryQuantity"
                    name="inventoryQuantity"
                    type="number"
                    min="0"
                    value={formData.inventoryQuantity}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del producto</CardTitle>
              <CardDescription>Añade imágenes para mostrar tu producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Imagen principal</Label>
                <ImageUpload onImageChange={handleImageChange} />
                <p className="text-sm text-muted-foreground">
                  Esta imagen se mostrará como la principal en la tienda y en los listados de productos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
