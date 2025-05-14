"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Globe, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchSocialMediaMetafields, saveSocialMediaMetafields } from "@/lib/api/metafields"
import type { SocialMediaMetafields } from "@/types/metafields"

interface SocialMediaFormProps {
  onSave?: () => void
}

export function SocialMediaForm({ onSave }: SocialMediaFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [socialMedia, setSocialMedia] = useState<SocialMediaMetafields>({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    pinterest: "",
    linkedin: "",
    tiktok: "",
  })

  useEffect(() => {
    async function loadSocialMediaData() {
      setIsLoading(true)
      try {
        const data = await fetchSocialMediaMetafields()
        setSocialMedia(data)
      } catch (error) {
        console.error("Error loading social media data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de redes sociales",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSocialMediaData()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await saveSocialMediaMetafields("1", socialMedia)

      if (success) {
        toast({
          title: "Datos guardados",
          description: "La información de redes sociales se ha guardado correctamente",
        })

        if (onSave) {
          onSave()
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la información de redes sociales",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving social media data:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la información de redes sociales",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof SocialMediaMetafields, value: string) => {
    setSocialMedia((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando redes sociales...</CardTitle>
          <CardDescription>Obteniendo datos de redes sociales</CardDescription>
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
            <Globe className="h-5 w-5" />
            Redes sociales
          </CardTitle>
          <CardDescription>Configura los enlaces a tus perfiles de redes sociales</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/granitoskate"
              value={socialMedia.facebook || ""}
              onChange={(e) => handleInputChange("facebook", e.target.value)}
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
              value={socialMedia.instagram || ""}
              onChange={(e) => handleInputChange("instagram", e.target.value)}
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
              value={socialMedia.twitter || ""}
              onChange={(e) => handleInputChange("twitter", e.target.value)}
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
              value={socialMedia.youtube || ""}
              onChange={(e) => handleInputChange("youtube", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center">
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/company/granitoskate"
              value={socialMedia.linkedin || ""}
              onChange={(e) => handleInputChange("linkedin", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.302 5.124 5.124 0 0 1-1.508-3.635h-3.207v13.564c0 .998-.32 1.746-.96 2.244-.64.499-1.448.748-2.424.748a4.1 4.1 0 0 1-2.89-1.143A4.1 4.1 0 0 1 3.78 12.95c0-1.142.384-2.11 1.152-2.904a4.1 4.1 0 0 1 2.888-1.192c.32 0 .64.048.96.144v3.456a1.366 1.366 0 0 0-.96-.384c-.384 0-.704.144-.96.432a1.366 1.366 0 0 0-.384.96c0 .384.128.704.384.96.256.256.576.384.96.384.384 0 .704-.128.96-.384.256-.256.384-.576.384-.96V0h5.375c0 1.43.464 2.635 1.392 3.613.928.979 2.08 1.517 3.456 1.613v3.456a8.716 8.716 0 0 1-3.744-.864 8.458 8.458 0 0 1-2.976-2.352v9.98c0 1.714-.56 3.173-1.68 4.378-1.12 1.205-2.464 1.807-4.032 1.807-1.6 0-2.96-.602-4.08-1.807C1.56 18.62 1 17.16 1 15.446c0-1.714.56-3.173 1.68-4.378 1.12-1.205 2.48-1.807 4.08-1.807.32 0 .64.032.96.096V13.1a4.1 4.1 0 0 0-2.88 1.192 4.1 4.1 0 0 0-1.152 2.904c0 1.11.384 2.062 1.152 2.856a4.1 4.1 0 0 0 2.88 1.192c1.12 0 2-.352 2.64-1.056.64-.704.96-1.656.96-2.856V9.402c.704.928 1.552 1.683 2.544 2.267a6.73 6.73 0 0 0 3.408.883V9.018c-.352 0-.688-.048-1.008-.144a5.27 5.27 0 0 1-.96-.432 5.37 5.37 0 0 1-.864-.672 5.37 5.37 0 0 1-.672-.864 5.27 5.27 0 0 1-.432-.96 3.045 3.045 0 0 1-.144-.384h3.12z"
                  fill="currentColor"
                />
              </svg>
              TikTok
            </Label>
            <Input
              id="tiktok"
              placeholder="https://tiktok.com/@granitoskate"
              value={socialMedia.tiktok || ""}
              onChange={(e) => handleInputChange("tiktok", e.target.value)}
            />
          </div>
        </div>

        <div className="bg-muted/30 border rounded-md p-4">
          <h4 className="font-medium mb-2">Beneficios de configurar tus redes sociales</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                ✓
              </span>
              <span>Mejora el SEO y la autoridad de dominio de tu tienda</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                ✓
              </span>
              <span>Permite a los motores de búsqueda verificar la autenticidad de tu negocio</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                ✓
              </span>
              <span>Facilita a los clientes encontrar tus perfiles sociales</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
