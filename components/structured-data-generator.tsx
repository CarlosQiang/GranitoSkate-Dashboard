"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Code, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchLocalBusinessMetafields } from "@/lib/api/metafields"
import { fetchSocialMediaMetafields } from "@/lib/api/metafields"
import type { LocalBusinessMetafields, SocialMediaMetafields } from "@/types/metafields"

export function StructuredDataGenerator() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [localBusiness, setLocalBusiness] = useState<LocalBusinessMetafields | null>(null)
  const [socialMedia, setSocialMedia] = useState<SocialMediaMetafields | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [localBusinessData, socialMediaData] = await Promise.all([
          fetchLocalBusinessMetafields(),
          fetchSocialMediaMetafields(),
        ])

        setLocalBusiness(localBusinessData)
        setSocialMedia(socialMediaData)
      } catch (error) {
        console.error("Error loading data for structured data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos para generar datos estructurados",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const generateLocalBusinessSchema = () => {
    if (!localBusiness) return "{}"

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.granitoskate.com/#organization",
      name: localBusiness.name || "Granito Skate Shop",
      url: "https://www.granitoskate.com/",
      telephone: localBusiness.telephone || "",
      email: localBusiness.email || "",
      address: {
        "@type": "PostalAddress",
        streetAddress: localBusiness.streetAddress || "",
        addressLocality: localBusiness.addressLocality || "",
        addressRegion: localBusiness.addressRegion || "",
        postalCode: localBusiness.postalCode || "",
        addressCountry: localBusiness.addressCountry || "ES",
      },
    }

    // Añadir coordenadas si están disponibles
    if (localBusiness.latitude && localBusiness.longitude) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: localBusiness.latitude,
        longitude: localBusiness.longitude,
      }
    }

    // Añadir horarios si están disponibles
    if (localBusiness.openingHours && localBusiness.openingHours.length > 0) {
      schema.openingHours = localBusiness.openingHours
    }

    // Añadir redes sociales si están disponibles
    if (socialMedia) {
      const sameAs = []
      if (socialMedia.facebook) sameAs.push(socialMedia.facebook)
      if (socialMedia.instagram) sameAs.push(socialMedia.instagram)
      if (socialMedia.twitter) sameAs.push(socialMedia.twitter)
      if (socialMedia.youtube) sameAs.push(socialMedia.youtube)
      if (socialMedia.linkedin) sameAs.push(socialMedia.linkedin)
      if (socialMedia.tiktok) sameAs.push(socialMedia.tiktok)

      if (sameAs.length > 0) {
        schema.sameAs = sameAs
      }
    }

    return JSON.stringify(schema, null, 2)
  }

  const generateProductSchema = () => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "Nombre del producto",
      image: ["https://www.granitoskate.com/images/product-1.jpg", "https://www.granitoskate.com/images/product-2.jpg"],
      description: "Descripción detallada del producto",
      sku: "SKU123",
      brand: {
        "@type": "Brand",
        name: "Marca del producto",
      },
      offers: {
        "@type": "Offer",
        url: "https://www.granitoskate.com/product/example",
        priceCurrency: "EUR",
        price: "99.99",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: localBusiness?.name || "Granito Skate Shop",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "89",
      },
    }

    return JSON.stringify(schema, null, 2)
  }

  const generateOrganizationSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.granitoskate.com/#organization",
      name: localBusiness?.name || "Granito Skate Shop",
      url: "https://www.granitoskate.com/",
      logo: "https://www.granitoskate.com/images/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: localBusiness?.telephone || "",
        contactType: "customer service",
        email: localBusiness?.email || "",
        availableLanguage: ["Spanish", "English"],
      },
    }

    // Añadir redes sociales si están disponibles
    if (socialMedia) {
      const sameAs = []
      if (socialMedia.facebook) sameAs.push(socialMedia.facebook)
      if (socialMedia.instagram) sameAs.push(socialMedia.instagram)
      if (socialMedia.twitter) sameAs.push(socialMedia.twitter)
      if (socialMedia.youtube) sameAs.push(socialMedia.youtube)
      if (socialMedia.linkedin) sameAs.push(socialMedia.linkedin)
      if (socialMedia.tiktok) sameAs.push(socialMedia.tiktok)

      if (sameAs.length > 0) {
        schema.sameAs = sameAs
      }
    }

    return JSON.stringify(schema, null, 2)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copiado",
      description: "Datos estructurados copiados al portapapeles",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando datos estructurados...</CardTitle>
          <CardDescription>Generando datos estructurados para SEO</CardDescription>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Generador de datos estructurados
        </CardTitle>
        <CardDescription>Genera código JSON-LD para mejorar el SEO de tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="local-business">
          <TabsList className="mb-4">
            <TabsTrigger value="local-business">Negocio local</TabsTrigger>
            <TabsTrigger value="product">Producto</TabsTrigger>
            <TabsTrigger value="organization">Organización</TabsTrigger>
          </TabsList>

          <TabsContent value="local-business">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm mb-2">
                  Este código JSON-LD ayuda a Google a mostrar información detallada de tu negocio local en los
                  resultados de búsqueda, incluyendo dirección, horarios y valoraciones.
                </p>
                <p className="text-sm font-medium">Cómo usar este código:</p>
                <ol className="text-sm space-y-1 mt-1 ml-4 list-decimal">
                  <li>Copia el código generado</li>
                  <li>Pégalo dentro de la etiqueta &lt;head&gt; de tu sitio web</li>
                  <li>O añádelo a través de Google Tag Manager</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs max-h-96">
                  {generateLocalBusinessSchema()}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(generateLocalBusinessSchema())}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="product">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm mb-2">
                  Este código JSON-LD ayuda a Google a mostrar información detallada de tus productos en los resultados
                  de búsqueda, incluyendo precio, disponibilidad y valoraciones.
                </p>
                <p className="text-sm font-medium">Cómo usar este código:</p>
                <ol className="text-sm space-y-1 mt-1 ml-4 list-decimal">
                  <li>Personaliza el código con los datos de tu producto</li>
                  <li>Copia el código generado</li>
                  <li>Pégalo dentro de la etiqueta &lt;head&gt; de la página del producto</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs max-h-96">
                  {generateProductSchema()}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(generateProductSchema())}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="organization">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm mb-2">
                  Este código JSON-LD ayuda a Google a entender la estructura de tu organización, incluyendo información
                  de contacto y redes sociales.
                </p>
                <p className="text-sm font-medium">Cómo usar este código:</p>
                <ol className="text-sm space-y-1 mt-1 ml-4 list-decimal">
                  <li>Copia el código generado</li>
                  <li>Pégalo dentro de la etiqueta &lt;head&gt; de tu sitio web</li>
                  <li>Asegúrate de que la URL del logo sea correcta</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs max-h-96">
                  {generateOrganizationSchema()}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(generateOrganizationSchema())}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
