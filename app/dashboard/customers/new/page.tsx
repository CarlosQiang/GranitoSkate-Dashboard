"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { createCustomer } from "@/lib/api/customers"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewCustomerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    acceptsMarketing: false,
    note: "",
    tags: "",
    address: {
      address1: "",
      address2: "",
      city: "",
      province: "",
      zip: "",
      country: "Spain",
      phone: "",
    },
    metafields: [
      {
        namespace: "customer",
        key: "dni",
        value: "",
        type: "single_line_text_field",
      },
    ],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      acceptsMarketing: checked,
    }))
  }

  const handleMetafieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "dni") {
      setFormData((prev) => ({
        ...prev,
        metafields: [
          {
            ...prev.metafields[0],
            value,
          },
        ],
      }))
    }
  }

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        country: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar los datos para la API
      const customerData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
      }

      // Si se proporciona un DNI, añadir una etiqueta específica
      if (formData.metafields[0].value) {
        customerData.tags = [...customerData.tags, `dni-${formData.metafields[0].value}`]
      }

      const result = await createCustomer(customerData)

      toast({
        title: "Cliente creado",
        description: "El cliente se ha creado correctamente",
      })

      // Redirigir a la página de detalles del cliente
      router.push(`/dashboard/customers/${result.id}`)
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        title: "Error",
        description: `No se pudo crear el cliente: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nuevo Cliente</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="address">Dirección</TabsTrigger>
            <TabsTrigger value="additional">Información adicional</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>Datos personales del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni">DNI/NIF</Label>
                  <Input
                    id="dni"
                    name="dni"
                    value={formData.metafields[0].value}
                    onChange={handleMetafieldChange}
                    placeholder="Ej: 12345678A"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptsMarketing"
                    checked={formData.acceptsMarketing}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="acceptsMarketing">Acepta recibir comunicaciones de marketing</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dirección</CardTitle>
                <CardDescription>Dirección principal del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address1">Dirección</Label>
                  <Input
                    id="address1"
                    name="address.address1"
                    value={formData.address.address1}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Apartamento, suite, etc.</Label>
                  <Input
                    id="address2"
                    name="address.address2"
                    value={formData.address.address2}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" name="address.city" value={formData.address.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      name="address.province"
                      value={formData.address.province}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">Código postal</Label>
                    <Input id="zip" name="address.zip" value={formData.address.zip} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select value={formData.address.country} onValueChange={handleCountryChange}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spain">España</SelectItem>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="France">Francia</SelectItem>
                        <SelectItem value="Italy">Italia</SelectItem>
                        <SelectItem value="Germany">Alemania</SelectItem>
                        <SelectItem value="United Kingdom">Reino Unido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressPhone">Teléfono de contacto</Label>
                  <Input
                    id="addressPhone"
                    name="address.phone"
                    value={formData.address.phone}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Información adicional</CardTitle>
                <CardDescription>Notas y etiquetas para este cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Notas</Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Añade notas sobre este cliente..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Separa las etiquetas con comas"
                  />
                  <p className="text-sm text-muted-foreground">Ejemplo: vip, cliente-frecuente, mayorista</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cliente
          </Button>
        </div>
      </form>
    </div>
  )
}
