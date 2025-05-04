"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchProductById, updateProduct, deleteProduct } from "@/lib/api/products"
import { generateSeoMetafields } from "@/lib/seo-utils"
import { SeoPreview } from "@/components/seo-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"
import { LoadingState } from "@/components/loading-state"
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

export default function ProductPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [productImage, setProductImage] = useState(null)
  const [product, setProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    vendor: "",
    productType: "",
    variants: [
      {
        price: "",
        compareAtPrice: "",
        sku: "",
        title: "Default",
      },
    ],
  })

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Asegurarse de que el ID no tenga el prefijo de Shopify
        const cleanId = params.id.replace("gid://shopify/Product/", "")
        console.log("Cargando producto con ID:", cleanId)

        const productData = await fetchProductById(cleanId)
        console.log("Datos del producto cargados:", productData)

        setProduct(productData)

        // Extraer la primera variante
        const firstVariant = productData.variants?.[0] || {}

        setFormData({
          title: productData.title || "",
          description: productData.descriptionHtml || productData.description || "",
          status: productData.status || "ACTIVE",
          vendor: productData.vendor || "",
          productType: productData.productType || "",
          variants: [
            {
              price: firstVariant.price?.amount || firstVariant.price || "",
              compareAtPrice: firstVariant.compareAtPrice?.amount || firstVariant.compareAtPrice || "",
              sku: firstVariant.sku || "",
              title: firstVariant.title || "Default",
            },
          ],
        })

        // Establecer la imagen si existe
        if (productData.featuredImage?.url) {
          setProductImage(productData.featuredImage.url)
        }
      } catch (err) {
        console.error("Error loading product:", err)
        setError(err.message || "No se pudo cargar el producto")
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

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
      // Preparar los datos para la API de Shopify
      const productData = {
        title: formData.title,
        descriptionHtml: formData.description,
        status: formData.status,
        vendor: formData.vendor,
        productType: formData.productType,
        // Añadir la imagen si existe y ha cambiado
        ...(productImage !== product?.featuredImage?.url && { image: productImage }),
        // Generar automáticamente los metafields de SEO
        metafields: generateSeoMetafields(formData.title, formData.description),
      }

      console.log("Enviando datos para actualizar producto:", productData)
      await updateProduct(params.id, productData)

      toast({
        title: "¡Producto actualizado!",
        description: "Los cambios se han guardado correctamente",
      })

      // Recargar la página para mostrar los datos actualizados
      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el producto: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteProduct(params.id)

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar el producto: ${error.message}`,
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando producto..." />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el producto</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => router.back()}>Volver a productos</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">{formData.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El producto será eliminado permanentemente de tu tienda.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
                  {isDeleting ? "Eliminando..." : "Eliminar producto"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSubmit} disabled={isSaving || !formData.title}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
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
              </div>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  El inventario se configurará automáticamente después de guardar el producto.
                </p>
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
                <ImageUpload onImageChange={handleImageChange} initialImage={productImage} />
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
