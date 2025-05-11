"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createCustomer, updateCustomer } from "@/lib/api/customers"
import { Save, Tag, Plus, X } from "lucide-react"

interface CustomerFormProps {
  initialData?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    note?: string
    acceptsMarketing?: boolean
    tags?: string[]
  }
  onSuccess?: (data: any) => void
  isEdit?: boolean
}

export function CustomerForm({ initialData, onSuccess, isEdit = false }: CustomerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    note: initialData?.note || "",
    acceptsMarketing: initialData?.acceptsMarketing || false,
    tags: initialData?.tags || [],
  })
  const [newTag, setNewTag] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptsMarketing: checked }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validate required fields
      if (!formData.email) {
        throw new Error("El email es obligatorio")
      }

      let result

      if (isEdit && initialData?.id) {
        result = await updateCustomer(initialData.id, formData)
        toast({
          title: "Cliente actualizado",
          description: "El cliente ha sido actualizado correctamente",
        })
      } else {
        result = await createCustomer(formData)
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado correctamente",
        })
      }

      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push(`/dashboard/customers/${result.id}`)
      }
    } catch (error: any) {
      console.error("Error saving customer:", error)
      toast({
        title: "Error",
        description: error.message || `No se pudo ${isEdit ? "actualizar" : "crear"} el cliente`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</CardTitle>
          <CardDescription>
            {isEdit ? "Actualiza la información del cliente" : "Introduce la información del nuevo cliente"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notas</Label>
            <Textarea id="note" name="note" value={formData.note} onChange={handleChange} rows={4} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="acceptsMarketing" checked={formData.acceptsMarketing} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="acceptsMarketing">Acepta marketing por email</Label>
          </div>

          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Añadir etiqueta"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Guardar cambios" : "Crear cliente"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
