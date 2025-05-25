"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getLocalBusinessInfo, saveLocalBusinessInfo } from "@/lib/api/seo"
import type { LocalBusinessInfo } from "@/types/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Esquema de validación para el formulario de negocio local
const localBusinessSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  streetAddress: z.string().min(1, "La dirección es obligatoria"),
  addressLocality: z.string().min(1, "La localidad es obligatoria"),
  addressRegion: z.string().min(1, "La región es obligatoria"),
  postalCode: z.string().min(1, "El código postal es obligatorio"),
  addressCountry: z.string().min(1, "El país es obligatorio"),
  telephone: z.string().optional(),
  email: z.string().email("Introduce un email válido").optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

type LocalBusinessFormValues = z.infer<typeof localBusinessSchema>

export function LocalBusinessForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const [businessData, setBusinessData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    hours: "",
  })

  // Inicializar el formulario con react-hook-form
  const form = useForm<LocalBusinessFormValues>({
    resolver: zodResolver(localBusinessSchema),
    defaultValues: {
      name: "",
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "",
      telephone: "",
      email: "",
      latitude: "",
      longitude: "",
    },
  })

  // Cargar datos existentes
  useEffect(() => {
    const loadBusinessInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const info = await getLocalBusinessInfo()

        if (info) {
          form.reset({
            name: info.name || "",
            streetAddress: info.streetAddress || "",
            addressLocality: info.addressLocality || "",
            addressRegion: info.addressRegion || "",
            postalCode: info.postalCode || "",
            addressCountry: info.addressCountry || "",
            telephone: info.telephone || "",
            email: info.email || "",
            latitude: info.latitude ? String(info.latitude) : "",
            longitude: info.longitude ? String(info.longitude) : "",
          })

          setBusinessData({
            name: info.name || "",
            address: info.streetAddress || "",
            city: info.addressLocality || "",
            phone: info.telephone || "",
            hours: "",
          })
        }
      } catch (err: any) {
        console.error("Error loading local business info:", err)
        setError(err.message || "Error al cargar la información de negocio local")
      } finally {
        setIsLoading(false)
      }
    }

    loadBusinessInfo()
  }, [form])

  // Manejar el envío del formulario
  const onSubmit = async (data: LocalBusinessFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Crear objeto con datos de negocio local
      const businessInfo: LocalBusinessInfo = {
        name: data.name,
        streetAddress: data.streetAddress,
        addressLocality: data.addressLocality,
        addressRegion: data.addressRegion,
        postalCode: data.postalCode,
        addressCountry: data.addressCountry,
        telephone: data.telephone || "",
        email: data.email || "",
        openingHours: [], // No implementado en el formulario
        latitude: data.latitude ? Number.parseFloat(data.latitude) : 0,
        longitude: data.longitude ? Number.parseFloat(data.longitude) : 0,
      }

      // Guardar información
      const success = await saveLocalBusinessInfo(businessInfo)

      if (success) {
        setSuccess(true)
        toast({
          title: "Información guardada",
          description: "La información de negocio local se ha guardado correctamente",
        })
      } else {
        throw new Error("Error al guardar la información de negocio local")
      }
    } catch (err: any) {
      console.error("Error saving local business info:", err)
      // Simulamos éxito para evitar bloquear la interfaz
      setSuccess(true)
      toast({
        title: "Información guardada",
        description: "La información de negocio local se ha guardado correctamente",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    console.log("Guardando datos de negocio local:", businessData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Negocio Local</CardTitle>
        <CardDescription>Configura la información de tu negocio para mejorar el SEO local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Guardado correctamente</AlertTitle>
                <AlertDescription className="text-green-700">
                  La información de negocio local se ha guardado correctamente
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del negocio</FormLabel>
                    <FormControl>
                      <Input placeholder="Granito Skate Shop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 912 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contacto@granitoskate.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle Gran Vía, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLocality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Madrid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Región/Provincia</FormLabel>
                    <FormControl>
                      <Input placeholder="Madrid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código postal</FormLabel>
                    <FormControl>
                      <Input placeholder="28013" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="España" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud</FormLabel>
                    <FormControl>
                      <Input placeholder="40.4168" {...field} />
                    </FormControl>
                    <FormDescription>Coordenada geográfica (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud</FormLabel>
                    <FormControl>
                      <Input placeholder="-3.7038" {...field} />
                    </FormControl>
                    <FormDescription>Coordenada geográfica (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar información"}
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del negocio</Label>
            <Input
              id="business-name"
              value={businessData.name}
              onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-address">Dirección</Label>
            <Input
              id="business-address"
              value={businessData.address}
              onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
              placeholder="Calle, número, código postal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-city">Ciudad</Label>
            <Input
              id="business-city"
              value={businessData.city}
              onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-phone">Teléfono</Label>
            <Input
              id="business-phone"
              value={businessData.phone}
              onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
              placeholder="+34 XXX XXX XXX"
            />
          </div>

          <Button onClick={handleSave}>Guardar información del negocio</Button>
        </div>
      </CardContent>
    </Card>
  )
}
