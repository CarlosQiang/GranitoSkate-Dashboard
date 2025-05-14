"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Info } from "lucide-react"
import { fetchSeoMetafields, updateSeoMetafields } from "@/lib/api/seo"

// Esquema de validación para el formulario SEO
const seoFormSchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional().or(z.literal("")),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
})

export function SeoForm({ ownerId, ownerType, defaultTitle = "", defaultDescription = "" }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Inicializar el formulario con valores por defecto
  const form = useForm<z.infer<typeof seoFormSchema>>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: defaultTitle,
      description: defaultDescription,
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    },
  })

  // Cargar los metafields existentes
  useEffect(() => {
    async function loadSeoMetafields() {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const metafields = await fetchSeoMetafields(ownerId, ownerType)

        // Mapear los metafields a los campos del formulario
        const formValues: any = {
          title: defaultTitle,
          description: defaultDescription,
          keywords: "",
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          twitterTitle: "",
          twitterDescription: "",
          twitterImage: "",
          canonicalUrl: "",
        }

        // Procesar cada metafield y asignarlo al campo correspondiente
        metafields.forEach((meta) => {
          if (meta.namespace === "seo") {
            if (meta.key === "title") {
              formValues.title = meta.value
            } else if (meta.key === "description") {
              formValues.description = meta.value
            } else if (meta.key === "keywords") {
              try {
                const keywords = JSON.parse(meta.value)
                formValues.keywords = Array.isArray(keywords) ? keywords.join(", ") : keywords
              } catch (e) {
                formValues.keywords = meta.value
              }
            } else if (meta.key === "og_title") {
              formValues.ogTitle = meta.value
            } else if (meta.key === "og_description") {
              formValues.ogDescription = meta.value
            } else if (meta.key === "og_image") {
              formValues.ogImage = meta.value
            } else if (meta.key === "twitter_title") {
              formValues.twitterTitle = meta.value
            } else if (meta.key === "twitter_description") {
              formValues.twitterDescription = meta.value
            } else if (meta.key === "twitter_image") {
              formValues.twitterImage = meta.value
            } else if (meta.key === "canonical_url") {
              formValues.canonicalUrl = meta.value
            }
          }
        })

        // Actualizar el formulario con los valores cargados
        form.reset(formValues)
      } catch (error) {
        console.error("Error loading SEO metafields:", error)
        setErrorMessage(error.message || "Error al cargar la configuración SEO")
      } finally {
        setIsLoading(false)
      }
    }

    loadSeoMetafields()
  }, [ownerId, ownerType, defaultTitle, defaultDescription, form])

  // Manejar el envío del formulario
  async function onSubmit(values: z.infer<typeof seoFormSchema>) {
    try {
      setIsSaving(true)
      setSaveStatus("idle")
      setErrorMessage("")

      // Convertir keywords de string a array
      const keywordsArray = values.keywords ? values.keywords.split(",").map((keyword) => keyword.trim()) : []

      // Preparar los metafields para guardar
      const metafieldsToSave = [
        {
          namespace: "seo",
          key: "title",
          value: values.title,
          type: "single_line_text_field",
        },
        {
          namespace: "seo",
          key: "description",
          value: values.description,
          type: "multi_line_text_field",
        },
        {
          namespace: "seo",
          key: "keywords",
          value: JSON.stringify(keywordsArray),
          type: "json",
        },
      ]

      // Añadir metafields opcionales si tienen valor
      if (values.ogTitle) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "og_title",
          value: values.ogTitle,
          type: "single_line_text_field",
        })
      }

      if (values.ogDescription) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "og_description",
          value: values.ogDescription,
          type: "multi_line_text_field",
        })
      }

      if (values.ogImage) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "og_image",
          value: values.ogImage,
          type: "url",
        })
      }

      if (values.twitterTitle) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "twitter_title",
          value: values.twitterTitle,
          type: "single_line_text_field",
        })
      }

      if (values.twitterDescription) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "twitter_description",
          value: values.twitterDescription,
          type: "multi_line_text_field",
        })
      }

      if (values.twitterImage) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "twitter_image",
          value: values.twitterImage,
          type: "url",
        })
      }

      if (values.canonicalUrl) {
        metafieldsToSave.push({
          namespace: "seo",
          key: "canonical_url",
          value: values.canonicalUrl,
          type: "url",
        })
      }

      // Guardar los metafields
      const result = await updateSeoMetafields(ownerId, metafieldsToSave, ownerType)

      if (result.success) {
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        throw new Error("Error al guardar la configuración SEO")
      }
    } catch (error) {
      console.error("Error saving SEO metafields:", error)
      setSaveStatus("error")
      setErrorMessage(error.message || "Error al guardar la configuración SEO")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {saveStatus === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Guardado correctamente</AlertTitle>
          <AlertDescription className="text-green-700">
            La configuración SEO se ha guardado correctamente.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="opengraph">Open Graph</TabsTrigger>
                <TabsTrigger value="twitter">Twitter</TabsTrigger>
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para SEO" {...field} />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Título que se mostrará en los resultados de búsqueda</span>
                        <Badge variant={field.value.length > 60 ? "destructive" : "outline"}>
                          {field.value.length}/60
                        </Badge>
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
                        <Textarea placeholder="Descripción para SEO" {...field} />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Descripción que se mostrará en los resultados de búsqueda</span>
                        <Badge variant={field.value.length > 160 ? "destructive" : "outline"}>
                          {field.value.length}/160
                        </Badge>
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
                      <FormLabel>Palabras clave</FormLabel>
                      <FormControl>
                        <Input placeholder="palabra1, palabra2, palabra3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Palabras clave separadas por comas (tienen poco impacto en SEO moderno)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="opengraph" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-4 w-4 text-blue-500" />
                      <p className="text-sm text-muted-foreground">
                        Open Graph es utilizado por Facebook y otras redes sociales para mostrar previsualizaciones
                        enriquecidas cuando se comparte tu contenido.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="ogTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Open Graph</FormLabel>
                          <FormControl>
                            <Input placeholder="Título para compartir en redes sociales" {...field} />
                          </FormControl>
                          <FormDescription>Si se deja vacío, se utilizará el título SEO general</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ogDescription"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Descripción Open Graph</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descripción para compartir en redes sociales" {...field} />
                          </FormControl>
                          <FormDescription>Si se deja vacío, se utilizará la descripción SEO general</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ogImage"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Imagen Open Graph</FormLabel>
                          <FormControl>
                            <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                          </FormControl>
                          <FormDescription>URL de la imagen para compartir en redes sociales</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="twitter" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-4 w-4 text-blue-500" />
                      <p className="text-sm text-muted-foreground">
                        Las tarjetas de Twitter permiten adjuntar fotos, videos y experiencias multimedia a tus tweets.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="twitterTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="Título para compartir en Twitter" {...field} />
                          </FormControl>
                          <FormDescription>
                            Si se deja vacío, se utilizará el título Open Graph o el título SEO general
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitterDescription"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Descripción Twitter</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descripción para compartir en Twitter" {...field} />
                          </FormControl>
                          <FormDescription>
                            Si se deja vacío, se utilizará la descripción Open Graph o la descripción SEO general
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitterImage"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Imagen Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL de la imagen para compartir en Twitter. Si se deja vacío, se utilizará la imagen Open
                            Graph
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-4 w-4 text-blue-500" />
                      <p className="text-sm text-muted-foreground">
                        Configuración avanzada para SEO. Estos campos son opcionales pero pueden mejorar el
                        posicionamiento en casos específicos.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="canonicalUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Canónica</FormLabel>
                          <FormControl>
                            <Input placeholder="https://ejemplo.com/pagina-original" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL canónica para evitar contenido duplicado. Déjala en blanco para usar la URL actual
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar SEO"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
