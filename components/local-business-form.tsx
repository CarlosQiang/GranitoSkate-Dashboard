"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { getLocalBusinessInfo, saveLocalBusinessInfo } from "@/lib/api/seo"
import { useToast } from "@/components/ui/use-toast"

// Esquema de validación para el formulario de negocio local
const localBusinessSchema = z.object({
  name: z.string().min(1, "El nombre del negocio es obligatorio"),
  streetAddress: z.string().min(1, "La dirección es obligatoria"),
  addressLocality: z.string().min(1, "La localidad es obligatoria"),
  addressRegion: z.string().min(1, "La región es obligatoria"),
  postalCode: z.string().min(1, "El código postal es obligatorio"),
  addressCountry: z.string().min(1, "El país es obligatorio"),
  telephone: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Introduce un email válido").min(1, "El email es obligatorio"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

type LocalBusinessFormValues = z.infer<typeof localBusinessSchema>

export function LocalBusinessForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

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

  // Cargar datos de negocio local existentes
  useEffect(() => {
    const loadLocalBusinessInfo = async () => {
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
        }
      } catch (err: any) {
        console.error("Error loading local business info:", err)
        setError(err.message || "Error al cargar la información del negocio local")
      } finally {
        setIsLoading(false)
      }
    }

    loadLocalBusinessInfo()
  }, [form])

  // Manejar el envío del formulario
  const onSubmit = async (data: LocalBusinessFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Crear objeto con datos del negocio local
      const localBusinessInfo = {
        name: data.name,
        streetAddress: data.streetAddress,
        addressLocality: data.addressLocality,
        addressRegion: data.addressRegion,
        postalCode: data.postalCode,
        addressCountry: data.addressCountry,
        telephone: data.telephone,
        email: data.email,
        latitude: data.latitude ? Number.parseFloat(data.latitude) : 0,
        longitude: data.longitude ? Number.parseFloat(data.longitude) : 0,
        openingHours: [], // Este campo se podría ampliar en el futuro
      }

      const success = await saveLocalBusinessInfo(localBusinessInfo)

      if (success) {
        setSuccess(true)
        toast({
          title: "Información guardada",
          description: "Los datos del negocio local se han guardado correctamente",
        })
      } else {
        throw new Error("Error al guardar la información del negocio local")
      }
    } catch (err: any) {
      console.error("Error saving local business info:", err)
      setError(err.message || "Error al guardar la información del negocio local")
      toast({
        title: "Error",
        description: err.message || "Error al guardar la información del negocio local",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Negocio Local</CardTitle>
        <CardDescription>
          Esta información se utilizará para generar datos estructurados de negocio local (Schema.org LocalBusiness)
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  La información del negocio local se ha guardado correctamente
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
                      <Input placeholder="Calle Ejemplo, 123" {...field} />
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
                    <FormLabel>Ciudad</FormLabel>
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
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input placeholder="28001" {...field} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="40.4168" {...field} />
                    </FormControl>
                    <FormDescription>Coordenada geográfica de latitud</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="-3.7038" {...field} />
                    </FormControl>
                    <FormDescription>Coordenada geográfica de longitud</FormDescription>
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
      </CardContent>
    </Card>
  )
}
