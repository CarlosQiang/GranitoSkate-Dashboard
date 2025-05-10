"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addCustomerAddress } from "@/lib/api/customers"

interface CustomerAddressFormProps {
  customerId: string
  onAddressAdded?: () => void
}

export function CustomerAddressForm({ customerId, onAddressAdded }: CustomerAddressFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    address1: "",
    address2: "",
    city: "",
    province: "",
    country: "España",
    zip: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addCustomerAddress(customerId, formData)
      setFormData({
        address1: "",
        address2: "",
        city: "",
        province: "",
        country: "España",
        zip: "",
      })
      if (onAddressAdded) onAddressAdded()
    } catch (error) {
      console.error("Error al añadir dirección:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Añadir Nueva Dirección</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address1">Dirección</Label>
            <Input id="address1" name="address1" value={formData.address1} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address2">Dirección (línea 2)</Label>
            <Input id="address2" name="address2" value={formData.address2} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input id="province" name="province" value={formData.province} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Código Postal</Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} required />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Añadiendo..." : "Añadir Dirección"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
