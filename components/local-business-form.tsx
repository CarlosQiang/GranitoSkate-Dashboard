"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export function LocalBusinessForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    businessType: "",
    openingHours: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Datos guardados",
        description: "La información del negocio local se ha guardado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la información",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg sm:text-xl">Información del Negocio Local</CardTitle>
        <CardDescription className="text-sm">
          Configura los datos de tu negocio para aparecer en búsquedas locales y Google My Business
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name" className="text-sm font-medium">
                Nombre del negocio
              </Label>
              <Input
                id="business-name"
                placeholder="GranitoSkate Shop"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-type" className="text-sm font-medium">
                Tipo de negocio
              </Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Tienda minorista</SelectItem>
                  <SelectItem value="sports">Tienda deportiva</SelectItem>
                  <SelectItem value="skateshop">Skate shop</SelectItem>
                  <SelectItem value="online">Tienda online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Dirección completa
            </Label>
            <Input
              id="address"
              placeholder="Calle Principal 123"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                Ciudad
              </Label>
              <Input
                id="city"
                placeholder="Madrid"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal-code" className="text-sm font-medium">
                Código postal
              </Label>
              <Input
                id="postal-code"
                placeholder="28001"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                País
              </Label>
              <Input
                id="country"
                placeholder="España"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="+34 123 456 789"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="info@granitoskate.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">
              Sitio web
            </Label>
            <Input
              id="website"
              placeholder="https://granitoskate.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción del negocio
            </Label>
            <Textarea
              id="description"
              placeholder="Tienda especializada en productos de skateboard..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-hours" className="text-sm font-medium">
              Horarios de apertura
            </Label>
            <Input
              id="opening-hours"
              placeholder="Lun-Vie: 10:00-20:00, Sáb: 10:00-14:00"
              value={formData.openingHours}
              onChange={(e) => handleInputChange("openingHours", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Guardando..." : "Guardar información"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
