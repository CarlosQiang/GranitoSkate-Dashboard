"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { addCustomerAddress } from "@/lib/api/customers"
import { Save, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomerAddressFormProps {
  customerId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerAddressForm({ customerId, onSuccess, onCancel }: CustomerAddressFormProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    country: "España",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validate required fields
      if (!formData.address1 || !formData.city || !formData.zip || !formData.country) {
        throw new Error("Por favor, completa los campos obligatorios")
      }

      await addCustomerAddress(customerId, formData)

      toast({
        title: "Dirección añadida",
        description: "La dirección ha sido añadida correctamente",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error adding address:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir la dirección",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva dirección</CardTitle>
        <CardDescription>Añade una nueva dirección para este cliente</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address1">
              Dirección <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              placeholder="Calle, número, piso..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2">Dirección (línea 2)</Label>
            <Input
              id="address2"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              placeholder="Apartamento, suite, unidad, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                Ciudad <span className="text-red-500">*</span>
              </Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input id="province" name="province" value={formData.province} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">
                Código postal <span className="text-red-500">*</span>
              </Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">
                País <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="España">España</SelectItem>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="Francia">Francia</SelectItem>
                  <SelectItem value="Italia">Italia</SelectItem>
                  <SelectItem value="Alemania">Alemania</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar dirección
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
