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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createProduct, updateProduct, getProductById } from "@/lib/actions"

const productFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "DRAFT"]),
  productType: z.string().optional(),
  vendor: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
  productId?: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState<any | null>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "ACTIVE",
      productType: "",
      vendor: "",
      tags: "",
      seoTitle: "",
      seoDescription: "",
    },
  })

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        setIsLoading(true)
        const data = await getProductById(productId)
        setProduct(data)

        form.reset({
          title: data.title,
          description: data.descriptionHtml || "",
          status: data.status,
          productType: data.productType || "",
          vendor: data.vendor || "",
          tags: data.tags?.join(", ") || "",
          seoTitle: data.seo?.title || "",
          seoDescription: data.seo?.description || "",
        })
      } catch (error) {
        console.error("Error al cargar el producto:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del producto",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId, form, toast])

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true)

    try {
      if (productId) {
        await updateProduct(productId, values)
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente",
        })
      } else {
        const newProduct = await createProduct(values)
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado correctamente",
        })
        router.push(`/dashboard/productos/${newProduct.id}`)
      }

      router.refresh()
    } catch (error) {
      console.error("Error al guardar el producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (productId && !product && isLoading) {
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
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
                    <Input placeholder="Nombre del producto" {...field} />
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
                    <Textarea placeholder="Descripción del producto" className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Tipo de producto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Proveedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <Input placeholder="Etiquetas separadas por comas" {...field} />
                  </FormControl>
                  <FormDescription>Separa las etiquetas con comas (ej: verano, oferta, nuevo)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {productId && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label>Variantes e inventario</Label>
                    <p className="text-sm text-muted-foreground">
                      Para gestionar variantes e inventario, utiliza la interfaz de Shopify.
                    </p>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        window.open(
                          `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/products/${productId}`,
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
                  <FormDescription>Si se deja en blanco, se utilizará el título del producto</FormDescription>
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
            onClick={() => router.push("/dashboard/productos")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Actualizar producto" : "Crear producto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
