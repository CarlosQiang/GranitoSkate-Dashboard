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
import { fetchProductById, updateProduct, deleteProduct } from "@/lib/api/products"
import { Package, ArrowLeft, Save, AlertTriangle, RefreshCw, Trash2, AlertCircle } from "lucide-react"
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
import { ProductSeoForm } from "@/components/product-seo-form"

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    vendor: "",
    productType: "",
  })

  const fetchProductData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Intentando cargar producto con ID: ${params.id}`)
      const productData = await fetchProductById(params.id)

      if (!productData) {
        throw new Error("No se pudo encontrar el producto")
      }

      console.log("Datos de producto recibidos:", productData)
      setProduct(productData)

      setFormData({
        title: productData.title || "",
        description: productData.description || "",
        status: productData.status || "ACTIVE",
        vendor: productData.vendor || "",
        productType: productData.productType || "",
      })
    } catch (error) {
      console.error("Error fetching product data:", error)
      setError(`No se pudo cargar la información del producto: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
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
    setError(null)

    try {
      const updateData = {
        title: formData.title,
        descriptionHtml: formData.description,
        status: formData.status,
        vendor: formData.vendor,
        productType: formData.productType,
        // Generar automáticamente los metafields de SEO
        metafields: generateSeoMetafields(formData.title, formData.description),
      }

      console.log("Enviando datos para actualizar producto:", updateData)
      await updateProduct(params.id, updateData)

      toast({
        title: "¡Producto actualizado!",
        description: "Los cambios se han guardado y optimizado para buscadores",
      })

      // Recargar los datos del producto
      fetchProductData()
    } catch (error) {
      console.error("Error updating product:", error)
      setError(`No se pudo actualizar el producto: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: `No se pudo actualizar el producto: ${(error as Error).message}`,
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
        description: `No se pudo eliminar el producto: ${(error as Error).message}`,
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

  if (error || !product) {
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
              <CardTitle className="text-destructive">Error al cargar el producto</CardTitle>
            </div>
            <CardDescription>
              No se pudo cargar la información del producto. Es posible que el producto haya sido eliminado o que no
              tengas permisos para acceder a él.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/products")}>
                Volver a productos
              </Button>
              <Button onClick={fetchProductData}>
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
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
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
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
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
          No te preocupes por el SEO. Tu producto se optimizará automáticamente para aparecer en Google usando el nombre
          y la descripción que escribas.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Información básica</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
          <TabsTrigger value="variants">Precio y stock</TabsTrigger>
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
                <Label htmlFor="status">
                  {formData.status === "ACTIVE" ? "Visible en tienda" : "Oculto (borrador)"}
                </Label>
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
                  {product.collections?.edges?.length > 0 ? (
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
                <Label htmlFor="title">
                  Nombre del producto <span className="text-red-500">*</span>
                </Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
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

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del producto</CardTitle>
              <CardDescription>Gestiona las imágenes de tu producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images?.edges?.length > 0 ? (
                  product.images.edges.map((edge: any) => (
                    <div key={edge.node.id} className="aspect-square rounded-md overflow-hidden bg-muted">
                      <Image
                        src={edge.node.url || "/placeholder.svg"}
                        alt={edge.node.altText || product.title}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <p className="col-span-4 text-center py-8 text-muted-foreground">No hay imágenes disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle>Precio y stock</CardTitle>
              <CardDescription>Gestiona las variantes de tu producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.variants?.edges?.length > 0 ? (
                  product.variants.edges.map((edge: any) => (
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
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No hay variantes disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <ProductSeoForm
            productId={params.id}
            productTitle={formData.title}
            productDescription={formData.description}
            productImage={product.featuredImage?.url}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
