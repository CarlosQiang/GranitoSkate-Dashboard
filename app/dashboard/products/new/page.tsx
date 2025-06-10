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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SeoPreview } from "@/components/seo-preview"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    vendor: "GranitoSkate",
    productType: "SKATEBOARD",
    price: "",
    compareAtPrice: "",
    sku: "",
    inventoryQuantity: "10", // Añadimos un valor por defecto
    handle: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleStatusChange = (checked) => {
    setFormData({
      ...formData,
      status: checked ? "ACTIVE" : "DRAFT",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.title) {
        throw new Error("El nombre del producto es obligatorio")
      }

      // Generar un handle a partir del título si no se ha especificado
      if (!formData.handle) {
        formData.handle =
          formData.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-") + "-"
      }

      // Preparar los datos para la API
      const productData = {
        ...formData,
      }

      console.log("Enviando datos para crear producto:", productData)
      const result = await createProduct(productData)

      toast({
        title: "¡Producto creado!",
        description: "El producto se ha creado correctamente",
      })

      // Redirigir a la página de productos
      toast({
        title: "¡Producto creado!",
        description: "El producto se ha creado correctamente",
      })
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error creating product:", error)
      setError(error.message || "No se pudo crear el producto")
      toast({
        title: "Error",
        description: `No se pudo crear el producto: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
          <h1 className="text-2xl font-bold tracking-tight">Nuevo producto</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading || !formData.title}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Posicionamiento automático</AlertTitle>
        <AlertDescription className="text-blue-700">
          No te preocupes por el SEO. Tu producto se optimizará automáticamente para aparecer en Google usando el nombre
          y la descripción que escribas.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Información básica</TabsTrigger>
          <TabsTrigger value="price">Precio y stock</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
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

        <TabsContent value="price" className="space-y-6">
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
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
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
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      value={formData.compareAtPrice}
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
                    name="sku"
                    value={formData.sku}
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
                    placeholder="10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
