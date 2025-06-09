"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react"

export function SocialMediaForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [socialData, setSocialData] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setSocialData((prev) => ({
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
        description: "Los enlaces de redes sociales se han guardado correctamente",
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
        <CardTitle className="text-lg sm:text-xl">Redes Sociales</CardTitle>
        <CardDescription className="text-sm">
          Configura los enlaces a tus redes sociales para mejorar tu presencia online
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-sm font-medium flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/granitoskate"
                value={socialData.facebook}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/granitoskate"
                value={socialData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm font-medium flex items-center gap-2">
                <Twitter className="h-4 w-4 text-blue-400" />
                Twitter / X
              </Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/granitoskate"
                value={socialData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="text-sm font-medium flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-600" />
                YouTube
              </Label>
              <Input
                id="youtube"
                placeholder="https://youtube.com/@granitoskate"
                value={socialData.youtube}
                onChange={(e) => handleInputChange("youtube", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/company/granitoskate"
                value={socialData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok" className="text-sm font-medium flex items-center gap-2">
                <div className="h-4 w-4 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                TikTok
              </Label>
              <Input
                id="tiktok"
                placeholder="https://tiktok.com/@granitoskate"
                value={socialData.tiktok}
                onChange={(e) => handleInputChange("tiktok", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Guardando..." : "Guardar enlaces"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
