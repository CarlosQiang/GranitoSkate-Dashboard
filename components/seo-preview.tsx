"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateSeoTitle, generateSeoDescription } from "@/lib/seo-utils"
import { Search } from "lucide-react"

interface SeoPreviewProps {
  title: string
  description: string
}

export function SeoPreview({ title, description }: SeoPreviewProps) {
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")

  useEffect(() => {
    setSeoTitle(generateSeoTitle(title))
    setSeoDescription(generateSeoDescription(description, title))
  }, [title, description])

  return (
    <Card className="border-granito/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-granito to-granito-light text-white">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <CardTitle className="text-base">Vista previa en Google</CardTitle>
        </div>
        <CardDescription className="text-white/80">
          Así se verá tu producto en los resultados de búsqueda
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">{seoTitle}</h3>
          <p className="text-green-700 text-sm">
            www.granitoskate.com › productos › {title.toLowerCase().replace(/\s+/g, "-")}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">{seoDescription}</p>
        </div>
      </CardContent>
    </Card>
  )
}
