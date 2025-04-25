"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createCollection, updateCollection, getCollectionById } from "@/lib/actions"

const collectionFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

type CollectionFormValues = z.infer<typeof collectionFormSchema>

interface CollectionFormProps {
  collectionId?: string
}

export function CollectionForm({ collectionId }: CollectionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [collection, setCollection] = useState<any | null>(null)

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
    },
  })

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return

      try {
        setIsLoading(true)
        const data = await getCollectionById(collectionId)
        setCollection(data)

        form.reset({
          title: data.title,
          description: data.descriptionHtml || "",
          seoTitle: data.seo?.title || "",
          seoDescription: data.seo?.description || "",
        })
      } catch (error) {
        console.error("Error al cargar la colección:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la colección",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollection()
  }, [collectionId, form, toast])

  const onSubmit = async (values: CollectionFormValues) => {
    setIsLoading(true)

    try {
      if (collectionId) {
        await updateCollection(collectionId, values)
        toast({
          title: "Colección actualizada",
          description: "La colección ha sido actualizada correctamente",
        })
      } else {
        const newCollection = await createCollection(values)
        toast({
          title: "Colección creada",
          description: "La colección ha sido creada correctamente",
        })
        router.push(`/dashboard/colecciones/${newCollection.id}`)
      }

      router.refresh()
    } catch (error) {
      console.error("Error al guardar la colección:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la colección. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (collectionId && !collection && isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la colección" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción de la colección" className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {collectionId && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <FormLabel>Productos en esta colección</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Para gestionar los productos en esta colección, utiliza la interfaz de Shopify.
                    </p>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        window.open(
                          `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/collections/${collectionId}`,
                          "_blank",
                        )
                      }}
                    >
                      Gestionar en Shopify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título SEO</FormLabel>
                  <FormControl>
                    <Input placeholder="Título para SEO" {...field} />
                  </FormControl>
                  <FormDescription>Si se deja en blanco, se utilizará el título de la colección</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción SEO</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción para SEO" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormDescription>Máximo 160 caracteres recomendados</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/colecciones")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {collectionId ? "Actualizar colección" : "Crear colección"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
