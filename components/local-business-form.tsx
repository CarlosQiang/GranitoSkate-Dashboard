"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchLocalBusinessMetafields, saveLocalBusinessMetafields } from "@/lib/api/metafields"
import type { LocalBusinessMetafields } from "@/types/metafields"

interface LocalBusinessFormProps {
  onSave?: () => void
}

export function LocalBusinessForm({ onSave }: LocalBusinessFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [localBusiness, setLocalBusiness] = useState<LocalBusinessMetafields>({
    name: "",
    streetAddress: "",
    addressLocality: "",
    addressRegion: "",
    postalCode: "",
    addressCountry: "",
    telephone: "",
    email: "",
    openingHours: [],
    latitude: 0,
    longitude: 0,
  })

  useEffect(() => {
    async function loadLocalBusinessData() {
      setIsLoading(true)
      try {
        const data = await fetchLocalBusinessMetafields()
        setLocalBusiness(data)
      } catch (error) {
        console.error("Error loading local business data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del negocio local",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLocalBusinessData()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await saveLocalBusinessMetafields("1", localBusiness)

      if (success) {
        toast({
          title: "Datos guardados",
          description: "La información del negocio local se ha guardado correctamente",
        })

        if (onSave) {
          onSave()
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la información del negocio local",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving local business data:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la información del negocio local",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof LocalBusinessMetafields, value: string | string[] | number) => {
    setLocalBusiness((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando información del negocio...</CardTitle>
          <CardDescription>Obteniendo datos del negocio local</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Información del negocio local
          </CardTitle>
          <CardDescription>Configura la información de tu tienda física para mejorar el SEO local</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información básica</h3>

          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del negocio</Label>
            <Input
              id="business-name"
              placeholder="Granito Skate Shop"
              value={localBusiness.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Dirección
          </h3>

          <div className="space-y-2">
            <Label htmlFor="street-address">Calle y número</Label>
            <Input
              id="street-address"
              placeholder="Calle Principal 123"
              value={localBusiness.streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locality">Ciudad</Label>
              <Input
                id="locality"
                placeholder="Madrid"
                value={localBusiness.addressLocality}
                onChange={(e) => handleInputChange("addressLocality", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Provincia</Label>
              <Input
                id="region"
                placeholder="Madrid"
                value={localBusiness.addressRegion}
                onChange={(e) => handleInputChange("addressRegion", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal-code">Código postal</Label>
              <Input
                id="postal-code"
                placeholder="28001"
                value={localBusiness.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                placeholder="España"
                value={localBusiness.addressCountry}
                onChange={(e) => handleInputChange("addressCountry", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Phone className="mr-2 h-4 w-4" />
            Contacto
          </h3>

          <div className="space-y-2">
            <Label htmlFor="telephone">Teléfono</Label>
            <Input
              id="telephone"
              placeholder="+34 XXX XXX XXX"
              value={localBusiness.telephone}
              onChange={(e) => handleInputChange("telephone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@granitoskate.com"
              value={localBusiness.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Horario de apertura
          </h3>

          <div className="space-y-2">
            <Label htmlFor="opening-hours">Horario (una línea por día)</Label>
            <Textarea
              id="opening-hours"
              placeholder="Lun-Vie: 10:00-20:00&#10;Sáb: 10:00-14:00&#10;Dom: Cerrado"
              value={localBusiness.openingHours.join("\n")}
              onChange={(e) => handleInputChange("openingHours", e.target.value.split("\n"))}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Introduce cada horario en una línea nueva (ej: Lun-Vie: 10:00-20:00)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ubicación en el mapa</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                placeholder="40.4168"
                value={localBusiness.latitude || ""}
                onChange={(e) => handleInputChange("latitude", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitud</Label>
              <Input
                id="longitude"
                placeholder="-3.7038"
                value={localBusiness.longitude || ""}
                onChange={(e) => handleInputChange("longitude", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="bg-muted/30 border rounded-md p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Puedes obtener las coordenadas de tu tienda desde Google Maps. Busca tu ubicación, haz clic derecho y
              selecciona "¿Qué hay aquí?". Las coordenadas aparecerán en la parte inferior.
            </p>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Vista previa del mapa</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
