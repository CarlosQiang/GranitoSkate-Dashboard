"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import type { WebPresence } from "@/types/markets"

interface SeoPreviewCardProps {
  webPresence: WebPresence | null
}

export function SeoPreviewCard({ webPresence }: SeoPreviewCardProps) {
  if (!webPresence) {
    return null
  }

  const title = webPresence.seo.title || "Granito Skate Shop"
  const description = webPresence.seo.description || "Tienda de skate con los mejores productos para skaters."
  const url = webPresence.url || "https://granitoskate.com"

  return (
    <Card className="border-granito/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-granito to-granito-light text-white">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <CardTitle className="text-base">Vista previa en Google</CardTitle>
        </div>
        <CardDescription className="text-white/80">Así se verá tu tienda en los resultados de búsqueda</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">{title}</h3>
          <p className="text-green-700 text-sm">{url}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
