"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createCollection } from "@/lib/api/collections"
import { generateSeoMetafields, generateSeoHandle } from "@/lib/seo-utils"
import { SeoPreview } from "@/components/seo-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewCollectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Generar handle SEO-friendly
      const handle = generateSeoHandle(formData.title)

      const collectionData = {
        title: formData.title,
        descriptionHtml: formData.description,
        handle: handle,
        // Generar automáticamente los metafields de SEO
        metafields: generateSeoMetafields(formData.title, formData.description),
      }

      await createCollection(collectionData)

      toast({
        title: "¡Colección creada!",
        description: "Tu colección ya está disponible en la tienda y optimizada para buscadores",
      })

      // Redirigir a la página de colecciones después de crear
      router.push("/dashboard/collections")
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la colección. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/collections")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nueva colección</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving || !formData.title}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar colección"}
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Posicionamiento automático</AlertTitle>
        <AlertDescription className="text-blue-700">
          No te preocupes por el SEO. Tu colección se optimizará automáticamente para aparecer en Google usando el
          nombre y la descripción que escribas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Información de la colección</CardTitle>
          <CardDescription>Datos principales de tu colección</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Nombre de la colección <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Tablas completas, Ofertas de verano, etc."
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
              placeholder="Describe esta colección para que tus clientes entiendan qué productos incluye"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vista previa de Google */}
      {formData.title && <SeoPreview title={formData.title} description={formData.description} />}
    </div>
  )
}
