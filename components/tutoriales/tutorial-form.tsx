"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const tutorialSchema = z.object({
  titulo: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  descripcion: z.string().optional(),
  contenido: z.string().min(10, { message: "El contenido debe tener al menos 10 caracteres" }),
  imagen_url: z.string().url({ message: "Debe ser una URL válida" }).optional().or(z.literal("")),
  publicado: z.boolean().default(false),
  destacado: z.boolean().default(false),
})

type TutorialFormValues = z.infer<typeof tutorialSchema>

interface TutorialFormProps {
  tutorial?: {
    id?: number
    titulo: string
    descripcion?: string
    contenido: string
    imagen_url?: string
    publicado?: boolean
    destacado?: boolean
  }
}

export default function TutorialForm({ tutorial }: TutorialFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!tutorial?.id

  const form = useForm<TutorialFormValues>({
    resolver: zodResolver(tutorialSchema),
    defaultValues: {
      titulo: tutorial?.titulo || "",
      descripcion: tutorial?.descripcion || "",
      contenido: tutorial?.contenido || "",
      imagen_url: tutorial?.imagen_url || "",
      publicado: tutorial?.publicado || false,
      destacado: tutorial?.destacado || false,
    },
  })

  async function onSubmit(data: TutorialFormValues) {
    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/tutoriales/${tutorial.id}` : "/api/tutoriales"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el tutorial")
      }

      toast({
        title: isEditing ? "Tutorial actualizado" : "Tutorial creado",
        description: isEditing
          ? "El tutorial ha sido actualizado correctamente"
          : "El tutorial ha sido creado correctamente",
      })

      router.push("/dashboard/tutoriales")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar tutorial:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el tutorial",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Tutorial" : "Crear Nuevo Tutorial"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información del tutorial existente"
            : "Completa el formulario para crear un nuevo tutorial"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del tutorial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción del tutorial" {...field} />
                  </FormControl>
                  <FormDescription>Esta descripción aparecerá en la vista previa del tutorial</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contenido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contenido del tutorial" className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imagen_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                  </FormControl>
                  <FormDescription>URL de la imagen de portada del tutorial</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <FormField
                control={form.control}
                name="publicado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Publicado</FormLabel>
                      <FormDescription>Hacer visible el tutorial para los usuarios</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destacado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Destacado</FormLabel>
                      <FormDescription>Mostrar el tutorial en la sección destacada</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar" : "Crear"} Tutorial
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
