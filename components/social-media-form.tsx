"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { getSocialMediaProfiles, saveSocialMediaProfiles } from "@/lib/api/seo"
import { useToast } from "@/components/ui/use-toast"

// Esquema de validación para el formulario de redes sociales
const socialMediaSchema = z.object({
  facebook: z.string().url("Introduce una URL válida").or(z.literal("")),
  instagram: z.string().url("Introduce una URL válida").or(z.literal("")),
  twitter: z.string().url("Introduce una URL válida").or(z.literal("")),
  youtube: z.string().url("Introduce una URL válida").or(z.literal("")),
  linkedin: z.string().url("Introduce una URL válida").or(z.literal("")),
  tiktok: z.string().url("Introduce una URL válida").or(z.literal("")),
})

type SocialMediaFormValues = z.infer<typeof socialMediaSchema>

export function SocialMediaForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  // Inicializar el formulario con react-hook-form
  const form = useForm<SocialMediaFormValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
      tiktok: "",
    },
  })

  // Cargar perfiles de redes sociales existentes
  useEffect(() => {
    const loadSocialMediaProfiles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const profiles = await getSocialMediaProfiles()

        if (profiles) {
          form.reset({
            facebook: profiles.facebook || "",
            instagram: profiles.instagram || "",
            twitter: profiles.twitter || "",
            youtube: profiles.youtube || "",
            linkedin: profiles.linkedin || "",
            tiktok: profiles.tiktok || "",
          })
        }
      } catch (err: any) {
        console.error("Error loading social media profiles:", err)
        setError(err.message || "Error al cargar los perfiles de redes sociales")
      } finally {
        setIsLoading(false)
      }
    }

    loadSocialMediaProfiles()
  }, [form])

  // Manejar el envío del formulario
  const onSubmit = async (data: SocialMediaFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      const success = await saveSocialMediaProfiles(data)

      if (success) {
        setSuccess(true)
        toast({
          title: "Perfiles guardados",
          description: "Los perfiles de redes sociales se han guardado correctamente",
        })
      } else {
        throw new Error("Error al guardar los perfiles de redes sociales")
      }
    } catch (err: any) {
      console.error("Error saving social media profiles:", err)
      setError(err.message || "Error al guardar los perfiles de redes sociales")
      toast({
        title: "Error",
        description: err.message || "Error al guardar los perfiles de redes sociales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfiles de Redes Sociales</CardTitle>
        <CardDescription>
          Añade los enlaces a tus perfiles de redes sociales para mejorar tu presencia online
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
                  Los perfiles de redes sociales se han guardado correctamente
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/granitoskate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/granitoskate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/granitoskate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/granitoskate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/company/granitoskate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok</FormLabel>
                    <FormControl>
                      <Input placeholder="https://tiktok.com/@granitoskate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar perfiles"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
