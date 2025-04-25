"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createCollection } from "@/lib/api/collections"

export default function NewCollectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    seo: {
      title: "",
      description: "",
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1]
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          [seoField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const collectionData = {
        title: formData.title,
        descriptionHtml: formData.description,
        metafields: [
          {
            namespace: "seo",
            key: "title",
            value: formData.seo.title || formData.title,
            type: "single_line_text_field",
          },
          {
            namespace: "seo",
            key: "description",
            value: formData.seo.description,
            type: "multi_line_text_field",
          },
        ],
      }

      const collection = await createCollection(collectionData)

      toast({
        title: "Colección creada",
        description: "La colección ha sido creada correctamente",
      })

      router.push(`/dashboard/collections/${collection.id.split("/").pop()}`)
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la colección. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nueva colección</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar colección"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la colección</CardTitle>
              <CardDescription>Información básica sobre la colección</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre de la colección</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nombre de la colección"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción de la colección"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimización para motores de búsqueda</CardTitle>
              <CardDescription>Mejora la visibilidad de tu colección en los resultados de búsqueda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Título SEO</Label>
                <Input
                  id="seo-title"
                  name="seo.title"
                  value={formData.seo.title}
                  onChange={handleInputChange}
                  placeholder="Título para motores de búsqueda"
                />
                <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">Descripción SEO</Label>
                <Textarea
                  id="seo-description"
                  name="seo.description"
                  value={formData.seo.description}
                  onChange={handleInputChange}
                  placeholder="Descripción para motores de búsqueda"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
