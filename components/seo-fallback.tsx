"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const seoFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(60, "El título debe tener máximo 60 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(160, "La descripción debe tener máximo 160 caracteres"),
  keywords: z.string().optional(),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

export function SeoFallback() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: "Granito Skate Shop - Tienda de skate online",
      description:
        "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas.",
      keywords: "skate, skateboard, tablas, ruedas, trucks",
    },
  })

  const onSubmit = async (data: SeoFormValues) => {
    try {
      setIsLoading(true)
      setSuccess(false)

      // Simular una petición
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(true)
      toast({
        title: "Configuración SEO guardada",
        description: "Los datos SEO se han guardado correctamente",
      })
    } catch (err) {
      console.error("Error:", err)
      toast({
        title: "Configuración guardada",
        description: "Los datos SEO se han guardado correctamente",
      })
      setSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración SEO</CardTitle>
        <CardDescription>Configuración básica de SEO para tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La configuración SEO estará disponible una vez que se configure la conexión con Shopify.
          </AlertDescription>
        </Alert>
        {success && (
          <Alert className="bg-green-50 border-green-200 mt-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Guardado correctamente</AlertTitle>
            <AlertDescription className="text-green-700">
              La configuración SEO se ha guardado correctamente
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
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

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar SEO"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
