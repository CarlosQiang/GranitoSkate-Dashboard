"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Globe, Share2, Twitter, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { seoFormSchema, type SeoFormValues } from "@/lib/validations/seo-schemas"
import { Skeleton } from "@/components/ui/skeleton"

interface EnhancedSeoFormProps {
  ownerId: string
  ownerType: string
  onSave?: () => void
  defaultTitle?: string
  defaultDescription?: string
  fetchSeoData: (ownerId: string, ownerType: string) => Promise<any>
  saveSeoData: (ownerId: string, ownerType: string, data: any) => Promise<boolean>
}

export function EnhancedSeoForm({
  ownerId,
  ownerType,
  onSave,
  defaultTitle = "",
  defaultDescription = "",
  fetchSeoData,
  saveSeoData,
}: EnhancedSeoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)

  // Inicializar el formulario con React Hook Form y Zod
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: defaultTitle,
      description: defaultDescription,
      keywords: [],
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      structuredData: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function loadSeoData() {
      setIsLoading(true)
      try {
        const seoData = await fetchSeoData(ownerId, ownerType)

        // Si no hay datos de SEO, usar los valores por defecto
        const formData = {
          ...seoData,
          title: seoData.title || defaultTitle,
          description: seoData.description || defaultDescription,
          keywords: Array.isArray(seoData.keywords) ? seoData.keywords : [],
          canonicalUrl: seoData.canonicalUrl || "",
          ogTitle: seoData.ogTitle || "",
          ogDescription: seoData.ogDescription || "",
          ogImage: seoData.ogImage || "",
          twitterCard: seoData.twitterCard || "summary_large_image",
          twitterTitle: seoData.twitterTitle || "",
          twitterDescription: seoData.twitterDescription || "",
          twitterImage: seoData.twitterImage || "",
          structuredData: seoData.structuredData || "",
        }

        form.reset(formData)
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
  }, [ownerId, ownerType, defaultTitle, defaultDescription, fetchSeoData, form, toast])

  const onSubmit = async (data: SeoFormValues) => {
    setIsSaving(true)
    setSaveSuccess(null)

    try {
      const success = await saveSeoData(ownerId, ownerType, data)

      if (success) {
        setSaveSuccess(true)
        toast({
          title: "SEO guardado",
          description: "La configuración de SEO se ha guardado correctamente",
        })

        if (onSave) {
          onSave()
        }
      } else {
        setSaveSuccess(false)
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración de SEO",
          variant: "destructive",
        })
      }
    } catch (error) {
      setSaveSuccess(false)
      console.error("Error saving SEO:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la configuración de SEO",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)

      // Ocultar el mensaje de éxito después de 3 segundos
      if (saveSuccess) {
        setTimeout(() => {
          setSaveSuccess(null)
        }, 3000)
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando SEO...</CardTitle>
          <CardDescription>Obteniendo configuración de SEO</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-40 w-full" />
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
            Configura cómo aparecerá este contenido en los resultados de búsqueda y redes sociales
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess === true && (
            <span className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Guardado
            </span>
          )}
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving || !form.formState.isDirty}>
            {isSaving ? "Guardando..." : "Guardar SEO"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {form.formState.errors.root && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para motores de búsqueda" {...field} />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Recomendado: 50-60 caracteres</span>
                        <span className={field.value.length > 60 ? "text-destructive" : ""}>
                          {field.value.length}/60
                        </span>
                      </FormDescription>
                      <FormMessage />
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
                      <FormDescription className="flex justify-between">
                        <span>Recomendado: 150-160 caracteres</span>
                        <span className={field.value.length > 160 ? "text-destructive" : ""}>
                          {field.value.length}/160
                        </span>
                      </FormDescription>
                      <FormMessage />
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
                      {form.watch("title") || defaultTitle || "Título de la página"}
                    </h3>
                    <p className="text-green-700 text-sm">www.granitoskate.com</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {form.watch("description") || defaultDescription || "Descripción de la página..."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 pt-4">
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
                    {form.watch("ogImage") && (
                      <div className="aspect-[1.91/1] bg-gray-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          Vista previa de imagen
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-gray-500">www.granitoskate.com</p>
                      <h3 className="font-bold">
                        {form.watch("ogTitle") || form.watch("title") || defaultTitle || "Título de la página"}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {form.watch("ogDescription") ||
                          form.watch("description") ||
                          defaultDescription ||
                          "Descripción de la página..."}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="twitter" className="space-y-4 pt-4">
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
                    {(form.watch("twitterImage") || form.watch("ogImage")) && (
                      <div className="aspect-[2/1] bg-gray-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          Vista previa de imagen
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-bold">
                        {form.watch("twitterTitle") ||
                          form.watch("ogTitle") ||
                          form.watch("title") ||
                          defaultTitle ||
                          "Título de la página"}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {form.watch("twitterDescription") ||
                          form.watch("ogDescription") ||
                          form.watch("description") ||
                          defaultDescription ||
                          "Descripción de la página..."}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">www.granitoskate.com</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="canonicalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL canónica</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.granitoskate.com/ruta-canonica" {...field} />
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
                          placeholder='{"@context":"https://schema.org","@type":"Product",...}'
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
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
