"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Globe, Share2, Twitter, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getCollectionSeoSettings, saveCollectionSeoSettings } from "@/lib/api/seo"
import {
  generateSeoTitle,
  generateSeoDescription,
  extractKeywords,
  generateCollectionStructuredData,
} from "@/lib/seo-utils"
import type { SeoSettings } from "@/types/seo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

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
  structuredData: z.string().optional().or(z.literal("")),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

interface CollectionSeoFormProps {
  collectionId: string
  collectionTitle: string
  collectionDescription: string
  collectionImage?: string
  collectionHandle?: string
  collectionProducts?: any[]
  onSave?: () => void
}

export function CollectionSeoForm({
  collectionId,
  collectionTitle,
  collectionDescription,
  collectionImage,
  collectionHandle,
  collectionProducts,
  onSave,
}: CollectionSeoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [seo, setSeo] = useState<SeoSettings>({
    title: collectionTitle,
    description: collectionDescription,
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: collectionImage || "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: collectionImage || "",
  })

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: collectionTitle,
      description: collectionDescription,
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: collectionImage || "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: collectionImage || "",
      canonicalUrl: "",
      structuredData: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function loadSeoData() {
      setIsLoading(true)
      try {
        const seoData = await getCollectionSeoSettings(collectionId)

        if (seoData) {
          setSeo(seoData)
          form.reset(seoData)
        } else {
          // Si no hay datos de SEO, usar los valores de la colección
          const defaultSeo = {
            title: generateSeoTitle(collectionTitle),
            description: generateSeoDescription(collectionDescription, collectionTitle),
            keywords: extractKeywords(collectionTitle, collectionDescription),
            ogTitle: "",
            ogDescription: "",
            ogImage: collectionImage || "",
            twitterCard: "summary_large_image" as const,
            twitterTitle: "",
            twitterDescription: "",
            twitterImage: collectionImage || "",
            canonicalUrl: collectionHandle
              ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/collections/${collectionHandle}`
              : "",
            structuredData: collectionHandle
              ? generateCollectionStructuredData({
                  title: collectionTitle,
                  description: collectionDescription,
                  image: { url: collectionImage },
                  handle: collectionHandle,
                  products: collectionProducts || [],
                  productsCount: collectionProducts?.length || 0,
                })
              : "",
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
  }, [
    collectionId,
    collectionTitle,
    collectionDescription,
    collectionImage,
    collectionHandle,
    collectionProducts,
    toast,
    form,
  ])

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

      const success = await saveCollectionSeoSettings(collectionId, form.getValues())

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

  const handleGenerateAutoSeo = async () => {
    setIsGenerating(true)
    try {
      // Generar automáticamente los datos de SEO
      const autoSeo = {
        title: generateSeoTitle(collectionTitle),
        description: generateSeoDescription(collectionDescription, collectionTitle),
        keywords: extractKeywords(collectionTitle, collectionDescription),
        ogTitle: generateSeoTitle(collectionTitle),
        ogDescription: generateSeoDescription(collectionDescription, collectionTitle),
        ogImage: collectionImage || "",
        twitterCard: "summary_large_image" as const,
        twitterTitle: generateSeoTitle(collectionTitle),
        twitterDescription: generateSeoDescription(collectionDescription, collectionTitle),
        twitterImage: collectionImage || "",
        canonicalUrl: collectionHandle
          ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/collections/${collectionHandle}`
          : "",
        structuredData: collectionHandle
          ? generateCollectionStructuredData({
              title: collectionTitle,
              description: collectionDescription,
              image: { url: collectionImage },
              handle: collectionHandle,
              products: collectionProducts || [],
              productsCount: collectionProducts?.length || 0,
            })
          : "",
      }

      setSeo(autoSeo)
      form.reset(autoSeo)

      toast({
        title: "SEO generado automáticamente",
        description: "Se ha generado la configuración de SEO basada en los datos de la colección",
      })
    } catch (error) {
      console.error("Error generating auto SEO:", error)
      toast({
        title: "Error",
        description: "No se pudo generar automáticamente la configuración de SEO",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
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
            Configura cómo aparecerá esta colección en los resultados de búsqueda y redes sociales
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateAutoSeo} disabled={isGenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generando..." : "Generar automáticamente"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar SEO"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">SEO automático</AlertTitle>
          <AlertDescription className="text-blue-700">
            El sistema genera automáticamente metadatos SEO optimizados a partir del título y descripción de la
            colección. Puedes usar el botón "Generar automáticamente" para actualizar estos datos en cualquier momento.
          </AlertDescription>
        </Alert>

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para motores de búsqueda" {...field} />
                      </FormControl>
                      <FormDescription>Recomendado: 50-60 caracteres</FormDescription>
                      <FormMessage />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className={field.value?.length > 60 ? "text-destructive" : ""}>
                          {field.value?.length || 0}/60
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción SEO</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción para motores de búsqueda" rows={3} {...field} />
                      </FormControl>
                      <FormDescription>Recomendado: 150-160 caracteres</FormDescription>
                      <FormMessage />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className={field.value?.length > 160 ? "text-destructive" : ""}>
                          {field.value?.length || 0}/160
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palabras clave (separadas por comas)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="skate, skateboard, tablas, ruedas"
                          value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                          onChange={(e) => {
                            const keywords = e.target.value
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean)
                            field.onChange(keywords)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(field.value) &&
                          field.value.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="mt-6 border rounded-md p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Vista previa en Google
                  </h4>
                  <div className="space-y-1">
                    <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">
                      {form.getValues("title") || collectionTitle}
                    </h3>
                    <p className="text-green-700 text-sm">www.granitoskate.com/colecciones/...</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {form.getValues("description") || collectionDescription}
                    </p>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ogTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título para Open Graph</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para compartir en redes sociales" {...field} />
                      </FormControl>
                      <FormDescription>Si se deja vacío, se usará el título SEO general</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ogDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción para Open Graph</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción para compartir en redes sociales" rows={3} {...field} />
                      </FormControl>
                      <FormDescription>Si se deja vacío, se usará la descripción SEO general</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de imagen para Open Graph</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormDescription>Tamaño recomendado: 1200x630 píxeles</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6 border rounded-md p-4 bg-blue-50">
                  <h4 className="font-medium mb-2 flex items-center text-blue-800">
                    <Share2 className="mr-2 h-4 w-4" />
                    Vista previa en Facebook
                  </h4>
                  <div className="bg-white border rounded-md overflow-hidden">
                    {form.getValues("ogImage") && (
                      <div className="aspect-[1.91/1] bg-gray-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          Vista previa de imagen
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-gray-500">www.granitoskate.com</p>
                      <h3 className="font-bold">
                        {form.getValues("ogTitle") || form.getValues("title") || collectionTitle}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {form.getValues("ogDescription") || form.getValues("description") || collectionDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="twitterCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de tarjeta de Twitter</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo de tarjeta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="summary">Resumen</SelectItem>
                          <SelectItem value="summary_large_image">Resumen con imagen grande</SelectItem>
                          <SelectItem value="app">Aplicación</SelectItem>
                          <SelectItem value="player">Reproductor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determina cómo se mostrará tu contenido cuando se comparta en Twitter
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título para Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para compartir en Twitter" {...field} />
                      </FormControl>
                      <FormDescription>
                        Si se deja vacío, se usará el título de Open Graph o el título SEO general
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción para Twitter</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción para compartir en Twitter" rows={3} {...field} />
                      </FormControl>
                      <FormDescription>
                        Si se deja vacío, se usará la descripción de Open Graph o la descripción SEO general
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de imagen para Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormDescription>Tamaño recomendado: 1200x600 píxeles</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6 border rounded-md p-4 bg-blue-50">
                  <h4 className="font-medium mb-2 flex items-center text-blue-800">
                    <Twitter className="mr-2 h-4 w-4" />
                    Vista previa en Twitter
                  </h4>
                  <div className="bg-white border rounded-md overflow-hidden">
                    {(form.getValues("twitterImage") || form.getValues("ogImage")) && (
                      <div className="aspect-[2/1] bg-gray-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          Vista previa de imagen
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-bold">
                        {form.getValues("twitterTitle") ||
                          form.getValues("ogTitle") ||
                          form.getValues("title") ||
                          collectionTitle}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {form.getValues("twitterDescription") ||
                          form.getValues("ogDescription") ||
                          form.getValues("description") ||
                          collectionDescription}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">www.granitoskate.com</p>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="canonicalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL canónica</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.granitoskate.com/colecciones/nombre-coleccion" {...field} />
                      </FormControl>
                      <FormDescription>Establece la URL canónica para evitar contenido duplicado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="structuredData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datos estructurados (JSON-LD)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"@context":"https://schema.org","@type":"CollectionPage",...}'
                          rows={6}
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Datos estructurados en formato JSON-LD para mejorar la visualización en resultados de búsqueda
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
