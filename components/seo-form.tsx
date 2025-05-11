"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Globe, Share2, Twitter, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchSeoMetafields, saveSeoMetafields } from "@/lib/api/metafields"
import { generateSeoTitle, generateSeoDescription, extractKeywords, generateShopStructuredData } from "@/lib/seo-utils"
import type { SeoMetafields } from "@/types/metafields"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SeoFormProps {
  ownerId: string
  ownerType: string
  onSave?: () => void
  defaultTitle?: string
  defaultDescription?: string
  shopInfo?: any
}

export function SeoForm({
  ownerId,
  ownerType,
  onSave,
  defaultTitle = "",
  defaultDescription = "",
  shopInfo,
}: SeoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [seo, setSeo] = useState<SeoMetafields>({
    title: defaultTitle,
    description: defaultDescription,
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    canonicalUrl: "",
    structuredData: "",
  })

  useEffect(() => {
    async function loadSeoData() {
      setIsLoading(true)
      try {
        const seoData = await fetchSeoMetafields(ownerId, ownerType)

        // Si no hay datos de SEO, usar los valores por defecto
        if (!seoData.title && defaultTitle) {
          seoData.title = generateSeoTitle(defaultTitle)
        }

        if (!seoData.description && defaultDescription) {
          seoData.description = generateSeoDescription(defaultDescription, defaultTitle)
        }

        if (!seoData.keywords || seoData.keywords.length === 0) {
          seoData.keywords = extractKeywords(defaultTitle, defaultDescription)
        }

        if (!seoData.structuredData && shopInfo) {
          seoData.structuredData = generateShopStructuredData(shopInfo)
        }

        setSeo(seoData)
      } catch (error) {
        console.error("Error loading SEO data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de SEO",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSeoData()
  }, [ownerId, ownerType, defaultTitle, defaultDescription, shopInfo, toast])

  // Modificar la función handleSave para incluir un indicador de éxito más visible
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await saveSeoMetafields(ownerId, ownerType, seo)

      if (success) {
        toast({
          title: "SEO guardado",
          description: "La configuración de SEO se ha guardado correctamente",
          variant: "success",
        })

        // Añadir un indicador visual de éxito
        const successElement = document.createElement("div")
        successElement.className =
          "fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 animate-fade-in-out"
        successElement.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>SEO guardado correctamente</span>
        </div>
      `
        document.body.appendChild(successElement)
        setTimeout(() => {
          document.body.removeChild(successElement)
        }, 3000)

        if (onSave) {
          onSave()
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración de SEO",
          variant: "destructive",
        })
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

  const handleInputChange = (field: keyof SeoMetafields, value: string | string[]) => {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateAutoSeo = async () => {
    setIsGenerating(true)
    try {
      // Generar automáticamente los datos de SEO
      const autoSeo = {
        title: generateSeoTitle(defaultTitle),
        description: generateSeoDescription(defaultDescription, defaultTitle),
        keywords: extractKeywords(defaultTitle, defaultDescription),
        ogTitle: generateSeoTitle(defaultTitle),
        ogDescription: generateSeoDescription(defaultDescription, defaultTitle),
        ogImage: seo.ogImage || "",
        twitterTitle: generateSeoTitle(defaultTitle),
        twitterDescription: generateSeoDescription(defaultDescription, defaultTitle),
        twitterImage: seo.twitterImage || "",
        canonicalUrl: `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""}`,
        structuredData: shopInfo ? generateShopStructuredData(shopInfo) : "",
      }

      setSeo(autoSeo)

      toast({
        title: "SEO generado automáticamente",
        description: "Se ha generado la configuración de SEO basada en los datos de la tienda",
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
          <CardDescription>Obteniendo configuración de SEO</CardDescription>
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
            <Search className="h-5 w-5" />
            Optimización para buscadores (SEO)
          </CardTitle>
          <CardDescription>
            Configura cómo aparecerá este contenido en los resultados de búsqueda y redes sociales
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
          <AlertTitle className="text-blue-800">SEO automático</AlertTitle>
          <AlertDescription className="text-blue-700">
            El sistema genera automáticamente metadatos SEO optimizados a partir del título y descripción de la tienda.
            Puedes usar el botón "Generar automáticamente" para actualizar estos datos en cualquier momento.
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
                placeholder="skate, skateboard, tablas, ruedas"
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
                  {seo.title || defaultTitle || "Título de la página"}
                </h3>
                <p className="text-green-700 text-sm">www.granitoskate.com</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {seo.description || defaultDescription || "Descripción de la página..."}
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
                  <h3 className="font-bold">{seo.ogTitle || seo.title || defaultTitle || "Título de la página"}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seo.ogDescription || seo.description || defaultDescription || "Descripción de la página..."}
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
                    {seo.twitterTitle || seo.ogTitle || seo.title || defaultTitle || "Título de la página"}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seo.twitterDescription ||
                      seo.ogDescription ||
                      seo.description ||
                      defaultDescription ||
                      "Descripción de la página..."}
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
                placeholder="https://www.granitoskate.com/ruta-canonica"
                value={seo.canonicalUrl || ""}
                onChange={(e) => handleInputChange("canonicalUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Establece la URL canónica para evitar contenido duplicado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="structured-data">Datos estructurados (JSON-LD)</Label>
              <Textarea
                id="structured-data"
                placeholder='{"@context":"https://schema.org","@type":"Product",...}'
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
