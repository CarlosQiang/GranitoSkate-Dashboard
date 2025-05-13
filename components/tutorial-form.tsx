"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { Loader2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { slugify } from "@/lib/utils"
import { MDXEditor } from "@/components/mdx-editor"

// Esquema de validación
const tutorialSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  slug: z
    .string()
    .min(5, "El slug debe tener al menos 5 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede contener letras minúsculas, números y guiones"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  contenido: z.string().min(50, "El contenido debe tener al menos 50 caracteres"),
  imagen_url: z.string().optional(),
  nivel_dificultad: z.enum(["principiante", "intermedio", "avanzado"]),
  tiempo_estimado: z.coerce.number().int().min(1, "El tiempo debe ser al menos 1 minuto").optional(),
  categorias: z.array(z.string()).min(1, "Selecciona al menos una categoría"),
  tags: z.array(z.string()),
  publicado: z.boolean().default(false),
  destacado: z.boolean().default(false),
})

type TutorialFormValues = z.infer<typeof tutorialSchema>

// Opciones predefinidas
const CATEGORIAS_OPCIONES = [
  "Equipamiento",
  "Principiantes",
  "Trucos",
  "Mantenimiento",
  "Competición",
  "Estilo",
  "Historia",
]

interface TutorialFormProps {
  tutorial?: any
  isEditing?: boolean
}

export function TutorialForm({ tutorial, isEditing = false }: TutorialFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(tutorial?.categorias || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(tutorial?.tags || [])

  // Configurar el formulario
  const form = useForm<TutorialFormValues>({
    resolver: zodResolver(tutorialSchema),
    defaultValues: {
      titulo: tutorial?.titulo || "",
      slug: tutorial?.slug || "",
      descripcion: tutorial?.descripcion || "",
      contenido: tutorial?.contenido || "",
      imagen_url: tutorial?.imagen_url || "",
      nivel_dificultad: tutorial?.nivel_dificultad || "principiante",
      tiempo_estimado: tutorial?.tiempo_estimado || 10,
      categorias: tutorial?.categorias || [],
      tags: tutorial?.tags || [],
      publicado: tutorial?.publicado || false,
      destacado: tutorial?.destacado || false,
    },
  })

  // Generar slug automáticamente al cambiar el título
  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value
    form.setValue("titulo", titulo)

    // Solo generar slug automáticamente si no estamos editando o si el slug está vacío
    if (!isEditing || !form.getValues("slug")) {
      const slug = slugify(titulo)
      form.setValue("slug", slug)
    }
  }

  // Manejar categorías
  const handleCategoriaToggle = (categoria: string) => {
    setSelectedCategorias((prev) => {
      const newCategorias = prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria]

      form.setValue("categorias", newCategorias)
      return newCategorias
    })
  }

  // Manejar tags
  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()]
      setSelectedTags(newTags)
      form.setValue("tags", newTags)
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag)
    setSelectedTags(newTags)
    form.setValue("tags", newTags)
  }

  // Manejar envío del formulario
  const onSubmit = async (data: TutorialFormValues) => {
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
        const error = await response.json()
        throw new Error(error.error || "Error al guardar el tutorial")
      }

      toast({
        title: isEditing ? "Tutorial actualizado" : "Tutorial creado",
        description: isEditing
          ? "El tutorial se ha actualizado correctamente"
          : "El tutorial se ha creado correctamente",
      })

      router.push("/dashboard/tutoriales")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el tutorial",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contenido">Contenido</TabsTrigger>
            <TabsTrigger value="metadatos">Metadatos</TabsTrigger>
            <TabsTrigger value="publicacion">Publicación</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título del tutorial" {...field} onChange={handleTituloChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="slug-del-tutorial" {...field} />
                    </FormControl>
                    <FormDescription>URL amigable para el tutorial</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción del tutorial" {...field} rows={3} />
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
                  <FormLabel>Imagen</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="contenido" className="space-y-4">
            <FormField
              control={form.control}
              name="contenido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <MDXEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="metadatos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nivel_dificultad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de dificultad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiempo_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo estimado (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categorias"
              render={() => (
                <FormItem>
                  <FormLabel>Categorías</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIAS_OPCIONES.map((categoria) => (
                      <Badge
                        key={categoria}
                        variant={selectedCategorias.includes(categoria) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleCategoriaToggle(categoria)}
                      >
                        {categoria}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Añadir etiqueta"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Añadir
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="publicacion" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="publicado"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publicado</FormLabel>
                          <FormDescription>Hacer visible el tutorial en la tienda</FormDescription>
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Destacado</FormLabel>
                          <FormDescription>Mostrar el tutorial en secciones destacadas</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/tutoriales")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Actualizar tutorial" : "Crear tutorial"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
