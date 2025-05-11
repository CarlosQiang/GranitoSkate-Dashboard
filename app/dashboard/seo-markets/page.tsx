"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Save, Globe, MapPin, Search, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { fetchWebPresence, saveSeoSettings } from "@/lib/api/markets"
import type { WebPresence } from "@/types/markets"

export default function SeoMarketsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [webPresence, setWebPresence] = useState<WebPresence | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const data = await fetchWebPresence()
        setWebPresence(data)
      } catch (error) {
        console.error("Error loading web presence data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de SEO y mercados",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleSave = async () => {
    if (!webPresence) return

    setIsSaving(true)
    try {
      const success = await saveSeoSettings(webPresence)

      if (success) {
        toast({
          title: "Configuración guardada",
          description: "La configuración de SEO y mercados ha sido guardada correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateWebPresence = (path: string, value: any) => {
    if (!webPresence) return

    // Función auxiliar para actualizar un objeto anidado
    const updateNestedObject = (obj: any, path: string, value: any) => {
      const parts = path.split(".")
      let current = obj

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {}
        }
        current = current[parts[i]]
      }

      current[parts[parts.length - 1]] = value
      return { ...obj }
    }

    setWebPresence((prev) => {
      if (!prev) return null
      return updateNestedObject({ ...prev }, path, value)
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SEO y Mercados</h1>
            <p className="text-muted-foreground">Gestiona la configuración de SEO y mercados de tu tienda</p>
          </div>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Cargando...</CardTitle>
              <CardDescription>Obteniendo información de SEO y mercados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO y Mercados</h1>
          <p className="text-muted-foreground">Gestiona la configuración de SEO y mercados de tu tienda</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Tabs defaultValue="seo">
        <TabsList>
          <TabsTrigger value="seo">
            <Search className="mr-2 h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="local-business">
            <MapPin className="mr-2 h-4 w-4" />
            Negocio Local
          </TabsTrigger>
          <TabsTrigger value="social-media">
            <Globe className="mr-2 h-4 w-4" />
            Redes Sociales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración SEO Global</CardTitle>
              <CardDescription>Configura los metadatos SEO principales de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Título SEO</Label>
                <Input
                  id="seo-title"
                  placeholder="Título SEO de tu tienda"
                  value={webPresence?.seo?.title || ""}
                  onChange={(e) => updateWebPresence("seo.title", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 50-60 caracteres. Actual: {webPresence?.seo?.title?.length || 0}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description">Descripción SEO</Label>
                <Textarea
                  id="seo-description"
                  placeholder="Descripción SEO de tu tienda"
                  value={webPresence?.seo?.description || ""}
                  onChange={(e) => updateWebPresence("seo.description", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 150-160 caracteres. Actual: {webPresence?.seo?.description?.length || 0}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Palabras clave (separadas por comas)</Label>
                <Input
                  id="seo-keywords"
                  placeholder="skate, skateboard, tablas, ruedas"
                  value={webPresence?.seo?.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    updateWebPresence(
                      "seo.keywords",
                      e.target.value.split(",").map((k) => k.trim()),
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración avanzada</CardTitle>
              <CardDescription>Opciones avanzadas de SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="structured-data" checked={true} disabled />
                <Label htmlFor="structured-data">Generar datos estructurados (Schema.org)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="sitemap" checked={true} disabled />
                <Label htmlFor="sitemap">Generar sitemap automáticamente</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-analytics">ID de Google Analytics</Label>
                <Input id="google-analytics" placeholder="G-XXXXXXXXXX" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local-business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del negocio local</CardTitle>
              <CardDescription>
                Esta información se utilizará para generar datos estructurados de negocio local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Nombre del negocio</Label>
                <Input
                  id="business-name"
                  placeholder="Granito Skate Shop"
                  value={webPresence?.localBusiness?.name || ""}
                  onChange={(e) => updateWebPresence("localBusiness.name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street-address">Dirección</Label>
                <Input
                  id="street-address"
                  placeholder="Calle y número"
                  value={webPresence?.localBusiness?.address?.streetAddress || ""}
                  onChange={(e) => updateWebPresence("localBusiness.address.streetAddress", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locality">Ciudad</Label>
                  <Input
                    id="locality"
                    placeholder="Ciudad"
                    value={webPresence?.localBusiness?.address?.addressLocality || ""}
                    onChange={(e) => updateWebPresence("localBusiness.address.addressLocality", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Provincia</Label>
                  <Input
                    id="region"
                    placeholder="Provincia"
                    value={webPresence?.localBusiness?.address?.addressRegion || ""}
                    onChange={(e) => updateWebPresence("localBusiness.address.addressRegion", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Código postal</Label>
                  <Input
                    id="postal-code"
                    placeholder="Código postal"
                    value={webPresence?.localBusiness?.address?.postalCode || ""}
                    onChange={(e) => updateWebPresence("localBusiness.address.postalCode", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    placeholder="País"
                    value={webPresence?.localBusiness?.address?.addressCountry || ""}
                    onChange={(e) => updateWebPresence("localBusiness.address.addressCountry", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Teléfono</Label>
                <Input
                  id="telephone"
                  placeholder="+34 XXX XXX XXX"
                  value={webPresence?.localBusiness?.telephone || ""}
                  onChange={(e) => updateWebPresence("localBusiness.telephone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contacto@granitoskate.com"
                  value={webPresence?.localBusiness?.email || ""}
                  onChange={(e) => updateWebPresence("localBusiness.email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening-hours">Horario de apertura</Label>
                <Textarea
                  id="opening-hours"
                  placeholder="Lun-Vie: 10:00-20:00, Sáb: 10:00-14:00"
                  value={webPresence?.localBusiness?.openingHours?.join("\n") || ""}
                  onChange={(e) => updateWebPresence("localBusiness.openingHours", e.target.value.split("\n"))}
                />
                <p className="text-xs text-muted-foreground">
                  Introduce cada horario en una línea nueva (ej: Lun-Vie: 10:00-20:00)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    placeholder="40.4168"
                    value={webPresence?.localBusiness?.geo?.latitude || ""}
                    onChange={(e) =>
                      updateWebPresence("localBusiness.geo.latitude", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    placeholder="-3.7038"
                    value={webPresence?.localBusiness?.geo?.longitude || ""}
                    onChange={(e) =>
                      updateWebPresence("localBusiness.geo.longitude", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social-media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redes sociales</CardTitle>
              <CardDescription>Configura los enlaces a tus redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/granitoskate"
                  value={webPresence?.socialMedia?.facebook || ""}
                  onChange={(e) => updateWebPresence("socialMedia.facebook", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center">
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/granitoskate"
                  value={webPresence?.socialMedia?.instagram || ""}
                  onChange={(e) => updateWebPresence("socialMedia.instagram", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/granitoskate"
                  value={webPresence?.socialMedia?.twitter || ""}
                  onChange={(e) => updateWebPresence("socialMedia.twitter", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center">
                  <Youtube className="mr-2 h-4 w-4" />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/granitoskate"
                  value={webPresence?.socialMedia?.youtube || ""}
                  onChange={(e) => updateWebPresence("socialMedia.youtube", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
