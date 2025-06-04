"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, Cloud } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

// Esquema de validación para el formulario SEO
const seoFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(60, "El título debe tener máximo 60 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(160, "La descripción debe tener máximo 160 caracteres"),
  keywords: z.string().optional(),
  syncWithShopify: z.boolean().default(false),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

interface SeoFormProps {
  ownerId: string
  ownerType: "PRODUCT" | "COLLECTION" | "SHOP"
  defaultTitle?: string
  defaultDescription?: string
  defaultKeywords?: string
  onSuccess?: () => void
}

export function SeoForm({
  ownerId,
  ownerType,
  defaultTitle = "",
  defaultDescription = "",
  defaultKeywords = "",
  onSuccess,
}: SeoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()

  // Inicializar el formulario con react-hook-form
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: defaultTitle,
      description: defaultDescription,
      keywords: defaultKeywords,
      syncWithShopify: false,
    },
  })

  // Cargar datos SEO existentes
  useEffect(() => {
    const loadSeoSettings = async () => {
      if (!ownerId) return

      try {
        setLoadingData(true)
        setError(null)

        const response = await fetch(`/api/seo?tipo_entidad=${ownerType}&id_entidad=${ownerId}`)

        if (response.ok) {
          const result = await response.json()

          if (result.success && result.data) {
            form.reset({
              title: result.data.titulo || defaultTitle,
              description: result.data.descripcion || defaultDescription,
              keywords: Array.isArray(result.data.palabras_clave)
                ? result.data.palabras_clave.join(", ")
                : defaultKeywords,
              syncWithShopify: false,
            })
          } else {
            // Si no hay datos, usar los valores por defecto
            form.reset({
              title: defaultTitle,
              description: defaultDescription,
              keywords: defaultKeywords,
              syncWithShopify: false,
            })
          }
        } else {
          console.warn("No se pudieron cargar los datos SEO existentes")
          form.reset({
            title: defaultTitle,
            description: defaultDescription,
            keywords: defaultKeywords,
            syncWithShopify: false,
          })
        }
      } catch (err: any) {
        console.error("Error loading SEO settings:", err)
        // No mostramos el error al usuario para no bloquear la interfaz
        form.reset({
          title: defaultTitle,
          description: defaultDescription,
          keywords: defaultKeywords,
          syncWithShopify: false,
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadSeoSettings()
  }, [ownerId, ownerType, defaultTitle, defaultDescription, defaultKeywords, form])

  const onSubmit = async (data: SeoFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Convertir keywords de string a array
      const keywordsArray = data.keywords ? data.keywords.split(",").map((k) => k.trim()) : []

      // Crear objeto con datos SEO
      const seoData = {
        tipo_entidad: ownerType,
        id_entidad: ownerId,
        titulo: data.title,
        descripcion: data.description,
        palabras_clave: keywordsArray,
        sincronizar_shopify: data.syncWithShopify,
      }

      const response = await fetch("/api/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(seoData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(true)
        toast({
          title: "Configuración SEO guardada",
          description: data.syncWithShopify
            ? "Los datos SEO se han guardado y sincronizado con Shopify"
            : "Los datos SEO se han guardado en la base de datos local",
        })

        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error(result.error || "Error al guardar la configuración SEO")
      }
    } catch (err: any) {
      console.error("Error saving SEO settings:", err)
      setError(err.message || "Error al guardar la configuración SEO")
      toast({
        title: "Error",
        description: err.message || "Error al guardar la configuración SEO",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Guardado correctamente</AlertTitle>
            <AlertDescription className="text-green-700">
              La configuración SEO se ha guardado correctamente
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título SEO</FormLabel>
              <FormControl>
                <Input placeholder="Título para SEO" {...field} />
              </FormControl>
              <FormDescription>
                El título que se mostrará en los resultados de búsqueda. Recomendado: 50-60 caracteres.
              </FormDescription>
              <FormMessage />
              <div className="text-xs text-muted-foreground mt-1">{field.value?.length || 0}/60 caracteres</div>
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
              <FormDescription>
                La descripción que se mostrará en los resultados de búsqueda. Recomendado: 150-160 caracteres.
              </FormDescription>
              <FormMessage />
              <div className="text-xs text-muted-foreground mt-1">{field.value?.length || 0}/160 caracteres</div>
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
                <Input placeholder="palabra1, palabra2, palabra3" {...field} />
              </FormControl>
              <FormDescription>Palabras clave relevantes para el contenido, separadas por comas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="syncWithShopify"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Sincronizar con Shopify
                </FormLabel>
                <FormDescription>Guardar también estos datos SEO como metafields en Shopify</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {isLoading ? "Guardando..." : "Guardar SEO"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
