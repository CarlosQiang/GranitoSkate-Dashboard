"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SocialMediaForm() {
  const [socialData, setSocialData] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
  })

  const handleSave = () => {
    console.log("Guardando datos de redes sociales:", socialData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redes Sociales</CardTitle>
        <CardDescription>Configura tus perfiles de redes sociales para mejorar la presencia online</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={socialData.facebook}
            onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })}
            placeholder="https://facebook.com/granitoskate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={socialData.instagram}
            onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
            placeholder="https://instagram.com/granitoskate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            value={socialData.twitter}
            onChange={(e) => setSocialData({ ...socialData, twitter: e.target.value })}
            placeholder="https://twitter.com/granitoskate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input
            id="youtube"
            value={socialData.youtube}
            onChange={(e) => setSocialData({ ...socialData, youtube: e.target.value })}
            placeholder="https://youtube.com/@granitoskate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok">TikTok</Label>
          <Input
            id="tiktok"
            value={socialData.tiktok}
            onChange={(e) => setSocialData({ ...socialData, tiktok: e.target.value })}
            placeholder="https://tiktok.com/@granitoskate"
          />
        </div>

        <Button onClick={handleSave}>Guardar redes sociales</Button>
      </CardContent>
    </Card>
  )
}
