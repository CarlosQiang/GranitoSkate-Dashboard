"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"
import type { WebPresence } from "@/types/markets"

interface StructuredDataPreviewProps {
  webPresence: WebPresence | null
}

export function StructuredDataPreview({ webPresence }: StructuredDataPreviewProps) {
  if (!webPresence) {
    return null
  }

  // Generar datos estructurados para LocalBusiness
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: webPresence.localBusiness.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: webPresence.localBusiness.address.streetAddress,
      addressLocality: webPresence.localBusiness.address.addressLocality,
      addressRegion: webPresence.localBusiness.address.addressRegion,
      postalCode: webPresence.localBusiness.address.postalCode,
      addressCountry: webPresence.localBusiness.address.addressCountry,
    },
    telephone: webPresence.localBusiness.telephone,
    email: webPresence.localBusiness.email,
    openingHours: webPresence.localBusiness.openingHours,
    geo: {
      "@type": "GeoCoordinates",
      latitude: webPresence.localBusiness.geo.latitude,
      longitude: webPresence.localBusiness.geo.longitude,
    },
    url: webPresence.url,
    sameAs: [
      webPresence.socialMedia.facebook,
      webPresence.socialMedia.instagram,
      webPresence.socialMedia.twitter,
      webPresence.socialMedia.youtube,
    ].filter(Boolean),
  }

  return (
    <Card className="border-granito/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-granito to-granito-light text-white">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <CardTitle className="text-base">Datos estructurados</CardTitle>
        </div>
        <CardDescription className="text-white/80">Datos estructurados que se generarán para tu tienda</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
          {JSON.stringify(localBusinessData, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}
