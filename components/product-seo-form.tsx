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
import { AlertCircle, CheckCircle } from "lucide-react"
import { getProductSeoSettings, saveProductSeoSettings } from "@/lib/api/seo"
import { useToast } from "@/components/ui/use-toast"

// Esquema de validación para el formulario SEO
const seoFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(60, "El título debe tener máximo 60 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(160, "La descripción debe tener máximo 160 caracteres"),
  keywords: z.string().optional(),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

interface ProductSeoFormProps {
  productId: string
  defaultTitle?: string
  defaultDescription?: string
  onSuccess?: () => void
}

export function ProductSeoForm({
  productId,
  defaultTitle = "",
  defaultDescription = "",
  onSuccess,
}: ProductSeoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  // Inicializar el formulario con react-hook-form
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: defaultTitle,
      description: defaultDescription,
      keywords: "",
    },
  })

  // Cargar datos SEO existentes
  useEffect(() => {
    const loadSeoSettings = async () => {
      if (!productId) return

      try {
        setIsLoading(true)
        setError(null)

        const seoSettings = await getProductSeoSettings(productId)

        if (seoSettings) {
          form.reset({
            title: seoSettings.title || defaultTitle,
            description: seoSettings.description || defaultDescription,
            keywords: Array.isArray(seoSettings.keywords) ? seoSettings.keywords.join(", ") : "",
          })
        } else {
          form.reset({
            title: defaultTitle,
            description: defaultDescription,
            keywords: "",
          })
        }
      } catch (err: any) {
        console.error("Error loading product SEO settings:", err)
        setError(err.message || "Error al cargar la configuración SEO del producto")
      } finally {
        setIsLoading(false)
      }
    }

    loadSeoSettings()
  }, [productId, defaultTitle, defaultDescription, form])

  // Manejar el envío del formulario
  const onSubmit = async (data: SeoFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Convertir keywords de string a array
      const keywordsArray = data.keywords ? data.keywords.split(",").map((k) => k.trim()) : []

      // Crear objeto con datos SEO
      const seoSettings = {
        title: data.title,
        description: data.description,
        keywords: keywordsArray,
      }

      const success = await saveProductSeoSettings(productId, seoSettings)

      if (success) {
        setSuccess(true)
        toast({
          title: "Configuración SEO guardada",
          description: "Los datos SEO del producto se han guardado correctamente",
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error("Error al guardar la configuración SEO del producto")
      }
    } catch (err: any) {
      console.error("Error saving product SEO settings:", err)
      setError(err.message || "Error al guardar la configuración SEO del producto")
      toast({
        title: "Error",
        description: err.message || "Error al guardar la configuración SEO del producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
              La configuración SEO del producto se ha guardado correctamente
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
              <FormDescription>Palabras clave relevantes para el producto, separadas por comas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar SEO"}
        </Button>
      </form>
    </Form>
  )
}
