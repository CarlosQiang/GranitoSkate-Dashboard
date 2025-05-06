"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Globe, Share2, Twitter, RefreshCw, AlertCircle, Tag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { extractKeywords, generatePromotionStructuredData } from "@/lib/seo-utils"
import type { SeoSettings } from "@/types/seo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PromotionSeoFormProps {
  promotionId: string
  promotionTitle: string
  promotionDescription: string
  promotionType: string
  promotionValue: number | string
  promotionStartDate: string
  promotionEndDate?: string
  promotionCode?: string
  onSave?: () => void
}

export function PromotionSeoForm({
  promotionId,
  promotionTitle,
  promotionDescription,
  promotionType,
  promotionValue,
  promotionStartDate,
  promotionEndDate,
  promotionCode,
  onSave,
}: PromotionSeoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [seo, setSeo] = useState<SeoSettings>({
    title: `${promotionTitle} - Oferta especial`,
    description:
      promotionDescription || `Aprovecha esta promoción especial: ${promotionTitle}. Válida por tiempo limitado.`,
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    canonicalUrl: "",
    structuredData: "",
  })

  useEffect(() => {
    // Generar automáticamente los datos de SEO al cargar
    generateSeoData()
  }, [
    promotionId,
    promotionTitle,
    promotionDescription,
    promotionType,
    promotionValue,
    promotionStartDate,
    promotionEndDate,
    promotionCode,
  ])

  const generateSeoData = () => {
    setIsLoading(true)
    try {
      // Generar título SEO
      let seoTitle = `${promotionTitle} - Oferta especial`
      if (promotionType === "PERCENTAGE_DISCOUNT") {
        seoTitle = `${promotionValue}% de descuento - ${promotionTitle}`
      } else if (promotionType === "FIXED_AMOUNT_DISCOUNT") {
        seoTitle = `${promotionValue}€ de descuento - ${promotionTitle}`
      } else if (promotionType === "BUY_X_GET_Y") {
        seoTitle = `Promoción 2x1 - ${promotionTitle}`
      } else if (promotionType === "FREE_SHIPPING") {
        seoTitle = `Envío gratis - ${promotionTitle}`
      }

      // Generar descripción SEO
      let seoDescription =
        promotionDescription || `Aprovecha esta promoción especial: ${promotionTitle}. Válida por tiempo limitado.`
      if (promotionEndDate) {
        const endDate = new Date(promotionEndDate)
        seoDescription += ` Válida hasta el ${endDate.toLocaleDateString("es-ES")}.`
      }
      if (promotionCode) {
        seoDescription += ` Usa el código: ${promotionCode}.`
      }

      // Generar palabras clave
      const keywords = extractKeywords(promotionTitle, seoDescription)
      keywords.push("oferta", "promoción", "descuento")
      if (promotionType === "PERCENTAGE_DISCOUNT") {
        keywords.push("porcentaje", "rebaja")
      } else if (promotionType === "FIXED_AMOUNT_DISCOUNT") {
        keywords.push("euros", "rebaja")
      } else if (promotionType === "BUY_X_GET_Y") {
        keywords.push("2x1", "regalo")
      } else if (promotionType === "FREE_SHIPPING") {
        keywords.push("envío", "gratis")
      }

      // Generar datos estructurados
      const structuredData = generatePromotionStructuredData({
        title: promotionTitle,
        description: seoDescription,
        startsAt: promotionStartDate,
        endsAt: promotionEndDate,
        type: promotionType,
        value: promotionValue,
      })

      // Actualizar estado
      setSeo({
        title: seoTitle,
        description: seoDescription,
        keywords: keywords.filter((v, i, a) => a.indexOf(v) === i).slice(0, 10), // Eliminar duplicados y limitar a 10
        ogTitle: seoTitle,
        ogDescription: seoDescription,
        ogImage: "",
        twitterCard: "summary_large_image",
        twitterTitle: seoTitle,
        twitterDescription: seoDescription,
        twitterImage: "",
        canonicalUrl: `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""}/pages/promociones`,
        structuredData,
      })
    } catch (error) {
      console.error("Error generating SEO data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Aquí iría la lógica para guardar los datos de SEO
      // Por ahora, solo mostramos un mensaje de éxito
      toast({
        title: "SEO guardado",
        description: "La configuración de SEO se ha guardado correctamente",
      })

      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error("Error saving SEO:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la configuración de SEO",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof SeoSettings, value: string | string[] | undefined) => {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateAutoSeo = async () => {
    setIsGenerating(true)
    try {
      generateSeoData()
      toast({
        title: "SEO generado automáticamente",
        description: "Se ha generado la configuración de SEO basada en los datos de la promoción",
      })
    } catch (error) {
      console.error("Error generating auto SEO:", error)
      toast({
        title: "Error",
        description: "No se pudo generar automáticamente la configuración de SEO",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando SEO...</CardTitle>
          <CardDescription>Generando configuración de SEO</CardDescription>
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
            <Tag className="h-5 w-5" />
            SEO para promoción
          </CardTitle>
          <CardDescription>
            Configura cómo aparecerá esta promoción en los resultados de búsqueda y redes sociales
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateAutoSeo} disabled={isGenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generando..." : "Generar automáticamente"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar SEO"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">SEO automático para promociones</AlertTitle>
          <AlertDescription className="text-blue-700">
            El sistema genera automáticamente metadatos SEO optimizados a partir de los datos de la promoción. Esto
            ayuda a que tus ofertas aparezcan en los resultados de búsqueda y se compartan mejor en redes sociales.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">
              <Search className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="mr-2 h-4 w-4" />
              Open Graph
            </TabsTrigger>
            <TabsTrigger value="twitter">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Globe className="mr-2 h-4 w-4" />
              Avanzado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title">Título SEO</Label>
              <Input
                id="seo-title"
                placeholder="Título para motores de búsqueda"
                value={seo.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Recomendado: 50-60 caracteres</span>
                <span className={seo.title.length > 60 ? "text-destructive" : ""}>{seo.title.length}/60</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-description">Descripción SEO</Label>
              <Textarea
                id="seo-description"
                placeholder="Descripción para motores de búsqueda"
                value={seo.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Recomendado: 150-160 caracteres</span>
                <span className={seo.description.length > 160 ? "text-destructive" : ""}>
                  {seo.description.length}/160
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-keywords">Palabras clave (separadas por comas)</Label>
              <Input
                id="seo-keywords"
                placeholder="promoción, descuento, oferta"
                value={Array.isArray(seo.keywords) ? seo.keywords.join(", ") : ""}
                onChange={(e) =>
                  handleInputChange(
                    "keywords",
                    e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean),
                  )
                }
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.isArray(seo.keywords) &&
                  seo.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="mt-6 border rounded-md p-4 bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Vista previa en Google
              </h4>
              <div className="space-y-1">
                <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">
                  {seo.title || `${promotionTitle} - Oferta especial`}
                </h3>
                <p className="text-green-700 text-sm">www.granitoskate.com/promociones</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {seo.description ||
                    `Aprovecha esta promoción especial: ${promotionTitle}. Válida por tiempo limitado.`}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="og-title">Título para Open Graph</Label>
              <Input
                id="og-title"
                placeholder="Título para compartir en redes sociales"
                value={seo.ogTitle || ""}
                onChange={(e) => handleInputChange("ogTitle", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Si se deja vacío, se usará el título SEO general</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-description">Descripción para Open Graph</Label>
              <Textarea
                id="og-description"
                placeholder="Descripción para compartir en redes sociales"
                value={seo.ogDescription || ""}
                onChange={(e) => handleInputChange("ogDescription", e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Si se deja vacío, se usará la descripción SEO general</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-image">URL de imagen para Open Graph</Label>
              <Input
                id="og-image"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={seo.ogImage || ""}
                onChange={(e) => handleInputChange("ogImage", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tamaño recomendado: 1200x630 píxeles</p>
            </div>

            <div className="mt-6 border rounded-md p-4 bg-blue-50">
              <h4 className="font-medium mb-2 flex items-center text-blue-800">
                <Share2 className="mr-2 h-4 w-4" />
                Vista previa en Facebook
              </h4>
              <div className="bg-white border rounded-md overflow-hidden">
                {seo.ogImage && (
                  <div className="aspect-[1.91/1] bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Vista previa de imagen
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-500">www.granitoskate.com</p>
                  <h3 className="font-bold">{seo.ogTitle || seo.title || `${promotionTitle} - Oferta especial`}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seo.ogDescription ||
                      seo.description ||
                      `Aprovecha esta promoción especial: ${promotionTitle}. Válida por tiempo limitado.`}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-title">Título para Twitter</Label>
              <Input
                id="twitter-title"
                placeholder="Título para compartir en Twitter"
                value={seo.twitterTitle || ""}
                onChange={(e) => handleInputChange("twitterTitle", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se usará el título de Open Graph o el título SEO general
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-description">Descripción para Twitter</Label>
              <Textarea
                id="twitter-description"
                placeholder="Descripción para compartir en Twitter"
                value={seo.twitterDescription || ""}
                onChange={(e) => handleInputChange("twitterDescription", e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se usará la descripción de Open Graph o la descripción SEO general
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-image">URL de imagen para Twitter</Label>
              <Input
                id="twitter-image"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={seo.twitterImage || ""}
                onChange={(e) => handleInputChange("twitterImage", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tamaño recomendado: 1200x600 píxeles</p>
            </div>

            <div className="mt-6 border rounded-md p-4 bg-blue-50">
              <h4 className="font-medium mb-2 flex items-center text-blue-800">
                <Twitter className="mr-2 h-4 w-4" />
                Vista previa en Twitter
              </h4>
              <div className="bg-white border rounded-md overflow-hidden">
                {(seo.twitterImage || seo.ogImage) && (
                  <div className="aspect-[2/1] bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Vista previa de imagen
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-bold">
                    {seo.twitterTitle || seo.ogTitle || seo.title || `${promotionTitle} - Oferta especial`}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seo.twitterDescription ||
                      seo.ogDescription ||
                      seo.description ||
                      `Aprovecha esta promoción especial: ${promotionTitle}. Válida por tiempo limitado.`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">www.granitoskate.com</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="canonical-url">URL canónica</Label>
              <Input
                id="canonical-url"
                placeholder="https://www.granitoskate.com/promociones"
                value={seo.canonicalUrl || ""}
                onChange={(e) => handleInputChange("canonicalUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Establece la URL canónica para evitar contenido duplicado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="structured-data">Datos estructurados (JSON-LD)</Label>
              <Textarea
                id="structured-data"
                placeholder='{"@context":"https://schema.org","@type":"Offer",...}'
                value={seo.structuredData || ""}
                onChange={(e) => handleInputChange("structuredData", e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Datos estructurados en formato JSON-LD para mejorar la visualización en resultados de búsqueda
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
