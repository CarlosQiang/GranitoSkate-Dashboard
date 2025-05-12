"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { createProduct } from "@/lib/api/products"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Save, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkShopifyEnvVars } from "@/lib/api/products"
import Link from "next/link"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useSampleData, setUseSampleData] = useState(false)
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    productType: "",
    vendor: "GranitoSkate",
    status: "DRAFT",
    tags: "",
    seo: {
      title: "",
      description: "",
      keywords: "",
    },
  })

  const envStatus = checkShopifyEnvVars()

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setProductData({
        ...productData,
        [parent]: {
          ...productData[parent],
          [child]: value,
        },
      })
    } else {
      setProductData({
        ...productData,
        [field]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar datos para la API
      const productInput = {
        title: productData.title,
        descriptionHtml: `<p>${productData.description}</p>`,
        productType: productData.productType,
        vendor: productData.vendor,
        status: productData.status,
        tags: productData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        metafields: [
          {
            namespace: "seo",
            key: "title",
            value: productData.seo.title || productData.title,
            type: "single_line_text_field",
          },
          {
            namespace: "seo",
            key: "description",
            value: productData.seo.description || productData.description.substring(0, 160),
            type: "single_line_text_field",
          },
          {
            namespace: "seo",
            key: "keywords",
            value: productData.seo.keywords || productData.tags,
            type: "single_line_text_field",
          },
        ],
      }

      // Crear producto
      const newProduct = await createProduct(productInput, !envStatus.isValid || useSampleData)

      toast({
        title: "Producto creado",
        description: `El producto "${newProduct.title}" ha sido creado correctamente.`,
      })

      // Redirigir a la página del producto
      router.push(`/dashboard/products/${newProduct.id.split("/").pop()}`)
    } catch (error) {
      console.error("Error al crear producto:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al crear el producto.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nuevo Producto</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>

      {!envStatus.isValid && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo de prueba</AlertTitle>
          <AlertDescription>
            No hay conexión con Shopify. El producto se guardará en modo de prueba y no se sincronizará con tu tienda.
            <div className="mt-2">
              <Switch id="use-sample-data" checked={useSampleData} onCheckedChange={setUseSampleData} />
              <Label htmlFor="use-sample-data" className="ml-2">
                Usar datos de muestra
              </Label>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>Información general del producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del producto *</Label>
                  <Input
                    id="title"
                    value={productData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ej: Skateboard Completo Profesional"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe tu producto..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-type">Tipo de producto</Label>
                    <Input
                      id="product-type"
                      value={productData.productType}
                      onChange={(e) => handleChange("productType", e.target.value)}
                      placeholder="Ej: Skateboard, Accesorios, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor">Fabricante</Label>
                    <Input
                      id="vendor"
                      value={productData.vendor}
                      onChange={(e) => handleChange("vendor", e.target.value)}
                      placeholder="Ej: GranitoSkate"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    value={productData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="Ej: skateboard, profesional, madera (separadas por comas)"
                  />
                  <p className="text-sm text-muted-foreground">Separa las etiquetas con comas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={productData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="ARCHIVED">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimización para motores de búsqueda (SEO)</CardTitle>
                <CardDescription>Mejora la visibilidad de tu producto en los motores de búsqueda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Título SEO</Label>
                  <Input
                    id="seo-title"
                    value={productData.seo.title}
                    onChange={(e) => handleChange("seo.title", e.target.value)}
                    placeholder={productData.title || "Título optimizado para SEO"}
                  />
                  <p className="text-sm text-muted-foreground">Si se deja en blanco, se usará el título del producto</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">Descripción SEO</Label>
                  <Textarea
                    id="seo-description"
                    value={productData.seo.description}
                    onChange={(e) => handleChange("seo.description", e.target.value)}
                    placeholder={productData.description || "Descripción optimizada para SEO"}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Máximo 160 caracteres. Si se deja en blanco, se usará la descripción del producto
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Palabras clave</Label>
                  <Input
                    id="seo-keywords"
                    value={productData.seo.keywords}
                    onChange={(e) => handleChange("seo.keywords", e.target.value)}
                    placeholder={productData.tags || "skateboard, profesional, madera"}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separa las palabras clave con comas. Si se deja en blanco, se usarán las etiquetas del producto
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  El SEO ayuda a que tu producto aparezca en los resultados de búsqueda de Google y otros motores de
                  búsqueda.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
