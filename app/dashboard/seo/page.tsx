"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Globe, AlertCircle } from "lucide-react"
import { SeoForm } from "@/components/seo-form"
import { LocalBusinessForm } from "@/components/local-business-form"
import { SocialMediaForm } from "@/components/social-media-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getShopSeoSettings, saveShopSeoSettings } from "@/lib/api/seo"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { SeoFallback } from "@/components/seo-fallback"

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(true)
  const [shopInfo, setShopInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [marketData, setMarketData] = useState({
    marketTitle: "",
    marketDescription: "",
    marketKeywords: "",
    targetCountries: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const seoSettings = await getShopSeoSettings()
        setShopInfo(seoSettings)

        // Inicializar datos de mercados
        if (seoSettings) {
          setMarketData({
            marketTitle: seoSettings.marketTitle || "",
            marketDescription: seoSettings.marketDescription || "",
            marketKeywords: Array.isArray(seoSettings.marketKeywords) ? seoSettings.marketKeywords.join(", ") : "",
            targetCountries: Array.isArray(seoSettings.targetCountries) ? seoSettings.targetCountries.join(", ") : "",
          })
        }
      } catch (error: any) {
        console.error("Error fetching shop SEO settings:", error)
        setError(error.message || "Error al cargar la configuración SEO")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopInfo()
  }, [])

  // Simular tiempo de carga al cambiar de pestaña
  const handleTabChange = (value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  const handleMarketDataChange = (field: string, value: string) => {
    setMarketData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveMarketData = async () => {
    try {
      setIsLoading(true)

      // Convertir strings separadas por comas a arrays
      const marketKeywordsArray = marketData.marketKeywords
        ? marketData.marketKeywords.split(",").map((item) => item.trim())
        : []

      const targetCountriesArray = marketData.targetCountries
        ? marketData.targetCountries.split(",").map((item) => item.trim())
        : []

      // Crear objeto con datos actualizados
      const updatedSettings = {
        ...shopInfo,
        marketTitle: marketData.marketTitle,
        marketDescription: marketData.marketDescription,
        marketKeywords: marketKeywordsArray,
        targetCountries: targetCountriesArray,
      }

      // Guardar configuración
      const success = await saveShopSeoSettings(updatedSettings)

      if (success) {
        toast({
          title: "Datos guardados",
          description: "La información de mercados se ha guardado correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la información de mercados",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error saving market data:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la información de mercados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO y Mercados</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración de SEO, mercados, negocio local y redes sociales para mejorar tu posicionamiento
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6">
      <div className="space-y-2 md:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SEO y Mercados</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona la configuración de SEO, mercados, negocio local y redes sociales para mejorar tu posicionamiento
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200 mx-0">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <div className="space-y-1">
          <AlertTitle className="text-blue-800 text-sm md:text-base">Optimización automática</AlertTitle>
          <AlertDescription className="text-blue-700 text-xs md:text-sm leading-relaxed">
            Configura la información de tu tienda para mejorar tu posicionamiento en buscadores. Los datos que
            introduzcas aquí se utilizarán para generar metadatos y datos estructurados automáticamente.
          </AlertDescription>
        </div>
      </Alert>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger
              value="general"
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm"
            >
              <Search className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">SEO General</span>
              <span className="sm:hidden">SEO</span>
            </TabsTrigger>
            <TabsTrigger
              value="local"
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm"
            >
              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Negocio Local</span>
              <span className="sm:hidden">Local</span>
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm"
            >
              <Globe className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Redes Sociales</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
            <TabsTrigger
              value="markets"
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm"
            >
              <Globe className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Mercados</span>
              <span className="sm:hidden">Markets</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración general de SEO</CardTitle>
                  <CardDescription>
                    Configura los metadatos principales que se utilizarán en toda tu tienda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error ? (
                    <SeoFallback />
                  ) : (
                    <SeoForm
                      ownerId="1"
                      ownerType="SHOP"
                      defaultTitle={shopInfo?.title || "Granito Skate Shop - Tienda de skate online"}
                      defaultDescription={
                        shopInfo?.description ||
                        "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas."
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="local" className="space-y-4">
              <LocalBusinessForm />
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <SocialMediaForm />
            </TabsContent>

            <TabsContent value="markets" className="space-y-4 mt-4">
              <Card className="mx-0">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Configuración de Mercados</CardTitle>
                  <CardDescription className="text-sm">
                    Configura la información de mercados y presencia web para tu tienda
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="market-title" className="text-sm font-medium">
                        Título SEO para Mercados
                      </Label>
                      <Input
                        id="market-title"
                        placeholder="Título SEO para mercados internacionales"
                        value={marketData.marketTitle}
                        onChange={(e) => handleMarketDataChange("marketTitle", e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="market-description" className="text-sm font-medium">
                        Descripción SEO para Mercados
                      </Label>
                      <Textarea
                        id="market-description"
                        placeholder="Descripción SEO para mercados internacionales"
                        value={marketData.marketDescription}
                        onChange={(e) => handleMarketDataChange("marketDescription", e.target.value)}
                        className="w-full min-h-[80px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="market-keywords" className="text-sm font-medium">
                        Palabras clave para Mercados
                      </Label>
                      <Input
                        id="market-keywords"
                        placeholder="skate, skateboard, tablas, ruedas"
                        value={marketData.marketKeywords}
                        onChange={(e) => handleMarketDataChange("marketKeywords", e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Separadas por comas</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="market-countries" className="text-sm font-medium">
                        Países objetivo
                      </Label>
                      <Input
                        id="market-countries"
                        placeholder="España, México, Argentina"
                        value={marketData.targetCountries}
                        onChange={(e) => handleMarketDataChange("targetCountries", e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Países donde quieres tener presencia comercial.</p>
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleSaveMarketData} disabled={isLoading} className="w-full md:w-auto">
                        {isLoading ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
