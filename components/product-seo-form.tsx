"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Globe, Share2, Twitter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getProductSeoSettings, saveProductSeoSettings } from "@/lib/api/seo"
import type { SeoSettings } from "@/types/seo"

// Añadir validación de formulario para mejorar la experiencia del usuario

// Añadir en la parte superior del archivo, después de los imports existentes:
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface ProductSeoFormProps {
  productId: string
  productTitle: string
  productDescription: string
  productImage?: string
  onSave?: () => void
}

// Añadir después de las interfaces:
const seoFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(70, "El título debe tener máximo 70 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(160, "La descripción debe tener máximo 160 caracteres"),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url("URL canónica inválida").optional().or(z.literal("")),
  ogTitle: z.string().max(70, "El título Open Graph debe tener máximo 70 caracteres").optional().or(z.literal("")),
  ogDescription: z
    .string()
    .max(200, "La descripción Open Graph debe tener máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  ogImage: z.string().url("URL de imagen Open Graph inválida").optional().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional(),
  twitterTitle: z.string().max(70, "El título de Twitter debe tener máximo 70 caracteres").optional().or(z.literal("")),
  twitterDescription: z
    .string()
    .max(200, "La descripción de Twitter debe tener máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  twitterImage: z.string().url("URL de imagen de Twitter inválida").optional().or(z.literal("")),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

export function ProductSeoForm({
  productId,
  productTitle,
  productDescription,
  productImage,
  onSave,
}: ProductSeoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [seo, setSeo] = useState<SeoSettings>({
    title: productTitle,
    description: productDescription,
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: productImage || "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: productImage || "",
  })

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: productTitle,
      description: productDescription,
      keywords: [],
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: productImage || "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: productImage || "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function loadSeoData() {
      setIsLoading(true)
      try {
        const seoData = await getProductSeoSettings(productId)

        if (seoData) {
          setSeo(seoData)
          form.reset(seoData)
        } else {
          // Si no hay datos de SEO, usar los valores del producto
          const defaultSeo = {
            title: productTitle,
            description: productDescription,
            keywords: [],
            ogTitle: "",
            ogDescription: "",
            ogImage: productImage || "",
            twitterCard: "summary_large_image",
            twitterTitle: "",
            twitterDescription: "",
            twitterImage: productImage || "",
            canonicalUrl: "",
            structuredData: "",
          }
          setSeo(defaultSeo)
          form.reset(defaultSeo)
        }
      } catch (error) {
        console.error("Error loading SEO data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de SEO",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSeoData()
  }, [productId, productTitle, productDescription, productImage, toast, form])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const values = await form.validate()
      if (!values) {
        toast({
          title: "Error",
          description: "Por favor, corrige los errores en el formulario.",
          variant: "destructive",
        })
        return
      }

      const success = await saveProductSeoSettings(productId, form.getValues())

      if (success) {
        toast({
          title: "SEO guardado",
          description: "La configuración de SEO se ha guardado correctamente",
        })

        if (onSave) {
          onSave()
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración de SEO",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving SEO:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la configuración de SEO",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof SeoSettings, value: string | string[] | undefined) => {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando SEO...</CardTitle>
          <CardDescription>Obteniendo configuración de SEO</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Optimización para buscadores (SEO)
          </CardTitle>
          <CardDescription>
            Configura cómo aparecerá este producto en los resultados de búsqueda y redes sociales
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar SEO"}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">
              <Search className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="mr-2 h-4 w-4" />
              Open Graph
            </TabsTrigger>
            <TabsTrigger value="twitter">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Globe className="mr-2 h-4 w-4" />
              Avanzado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="seo-title">Título SEO</FormLabel>
                      <FormControl>
                        <Input id="seo-title" placeholder="Título para motores de búsqueda" {...field} />
                      </FormControl>
                      <FormMessage />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Recomendado: 50-60 caracteres</span>
                        <span className={field.value?.length > 60 ? "text-destructive" : ""}>
                          {field.value?.length}/60
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              </Form>
            </div>

            <div className="space-y-2">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="seo-description">Descripción SEO</FormLabel>
                      <FormControl>
                        <Textarea
                          id="seo-description"
                          placeholder="Descripción para motores de búsqueda"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Recomendado: 150-160 caracteres</span>
                        <span className={field.value?.length > 160 ? "text-destructive" : ""}>
                          {field.value?.length}/160
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              </Form>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-keywords">Palabras clave (separadas por comas)</Label>
              <Input
                id="seo-keywords"
                placeholder="skate, skateboard, tablas, ruedas"
                value={Array.isArray(seo.keywords) ? seo.keywords.join(", ") : ""}
                onChange={(e) =>
                  handleInputChange(
                    "keywords",
                    e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean),
                  )
                }
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.isArray(seo.keywords) &&
                  seo.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="mt-6 border rounded-md p-4 bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Vista previa en Google
              </h4>
              <div className="space-y-1">
                <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">
                  {seo.title || productTitle}
                </h3>
                <p className="text-green-700 text-sm">www.granitoskate.com/productos/...</p>
                <p className="text-sm text-gray-600 line-clamp-2">{seo.description || productDescription}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="og-title">Título para Open Graph</Label>
              <Input
                id="og-title"
                placeholder="Título para compartir en redes sociales"
                value={seo.ogTitle || ""}
                onChange={(e) => handleInputChange("ogTitle", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Si se deja vacío, se usará el título SEO general</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-description">Descripción para Open Graph</Label>
              <Textarea
                id="og-description"
                placeholder="Descripción para compartir en redes sociales"
                value={seo.ogDescription || ""}
                onChange={(e) => handleInputChange("ogDescription", e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Si se deja vacío, se usará la descripción SEO general</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-image">URL de imagen para Open Graph</Label>
              <Input
                id="og-image"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={seo.ogImage || ""}
                onChange={(e) => handleInputChange("ogImage", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tamaño recomendado: 1200x630 píxeles</p>
            </div>

            <div className="mt-6 border rounded-md p-4 bg-blue-50">
              <h4 className="font-medium mb-2 flex items-center text-blue-800">
                <Share2 className="mr-2 h-4 w-4" />
                Vista previa en Facebook
              </h4>
              <div className="bg-white border rounded-md overflow-hidden">
                {seo.ogImage && (
                  <div className="aspect-[1.91/1] bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Vista previa de imagen
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-500">www.granitoskate.com</p>
                  <h3 className="font-bold">{seo.ogTitle || seo.title || productTitle}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seo.ogDescription || seo.description || productDescription}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-card">Tipo de tarjeta de Twitter</Label>
              <Select
                value={seo.twitterCard || "summary_large_image"}
                onValueChange={(value) => handleInputChange("twitterCard", value)}
              >
                <SelectTrigger id="twitter-card">
                  <SelectValue placeholder="Selecciona un tipo de tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumen</SelectItem>
                  <SelectItem value="summary_large_image">Resumen con imagen grande</SelectItem>
                  <SelectItem value="app">Aplicación</SelectItem>
                  <SelectItem value="player">Reproductor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determina cómo se mostrará tu contenido cuando se comparta en Twitter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-title">Título para Twitter</Label>
              <Input
                id="twitter-title"
                placeholder="Título para compartir en Twitter"
                value={seo.twitterTitle || ""}
                onChange={(e) => handleInputChange("twitterTitle", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se usará el título de Open Graph o el título SEO general
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-description">Descripción para Twitter</Label>
              <Textarea
                id="twitter-description"
                placeholder="Descripción para compartir en Twitter"
                value={seo.twitterDescription || ""}
                onChange={(e) => handleInputChange("twitterDescription", e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se usará la descripción de Open Graph o la descripción SEO general
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-image">URL de imagen para Twitter</Label>
              <Input
                id="twitter-image"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={seo.twitterImage || ""}
                onChange={(e) => handleInputChange("twitterImage", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tamaño recomendado: 1200x600 píxeles</p>
            </div>

            <div className="mt-6 border rounded-md p-4 bg-blue-50">
              <h4 className="font-medium mb-2 flex items-center text-blue-800">
                <Twitter className="mr-2 h-4 w-4" />
                Vista previa en Twitter
              </h4>
              <div className="bg-white border rounded-md overflow-hidden">
                {(seo.twitterImage || seo.ogImage) && (
                  <div className="aspect-[2/1] bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Vista previa de imagen
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-bold">{seo.twitterTitle || seo.ogTitle || seo.title || productTitle}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seo.twitterDescription || seo.ogDescription || seo.description || productDescription}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">www.granitoskate.com</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="canonical-url">URL canónica</Label>
              <Input
                id="canonical-url"
                placeholder="https://www.granitoskate.com/productos/nombre-producto"
                value={seo.canonicalUrl || ""}
                onChange={(e) => handleInputChange("canonicalUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Establece la URL canónica para evitar contenido duplicado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="structured-data">Datos estructurados (JSON-LD)</Label>
              <Textarea
                id="structured-data"
                placeholder='{"@context":"https://schema.org","@type":"Product",...}'
                value={seo.structuredData || ""}
                onChange={(e) => handleInputChange("structuredData", e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Datos estructurados en formato JSON-LD para mejorar la visualización en resultados de búsqueda
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
