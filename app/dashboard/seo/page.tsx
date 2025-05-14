"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Globe, Code, AlertCircle } from "lucide-react"
import { SeoForm } from "@/components/seo-form"
import { LocalBusinessForm } from "@/components/local-business-form"
import { SocialMediaForm } from "@/components/social-media-form"
import { StructuredDataGenerator } from "@/components/structured-data-generator"
import { Skeleton } from "@/components/ui/skeleton"
import { getShopSeoSettings } from "@/lib/api/seo"

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(true)
  const [shopInfo, setShopInfo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const seoSettings = await getShopSeoSettings()
        setShopInfo(seoSettings)
      } catch (error) {
        console.error("Error fetching shop SEO settings:", error)
        setError(error.message || "Error al cargar la configuración SEO")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopInfo()
  }, [])

  // Simular tiempo de carga al cambiar de pestaña
  const handleTabChange = (value) => {
    setIsLoading(true)
    setActiveTab(value)
    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO y Posicionamiento</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración de SEO, negocio local y redes sociales para mejorar tu posicionamiento
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO y Posicionamiento</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de SEO, negocio local y redes sociales para mejorar tu posicionamiento
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Optimización automática</AlertTitle>
        <AlertDescription className="text-blue-700">
          Configura la información de tu tienda para mejorar tu posicionamiento en buscadores. Los datos que introduzcas
          aquí se utilizarán para generar metadatos y datos estructurados automáticamente.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Search className="mr-2 h-4 w-4" />
            SEO General
          </TabsTrigger>
          <TabsTrigger value="local">
            <MapPin className="mr-2 h-4 w-4" />
            Negocio Local
          </TabsTrigger>
          <TabsTrigger value="social">
            <Globe className="mr-2 h-4 w-4" />
            Redes Sociales
          </TabsTrigger>
          <TabsTrigger value="structured">
            <Code className="mr-2 h-4 w-4" />
            Datos Estructurados
          </TabsTrigger>
        </TabsList>

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
                  <SeoForm
                    ownerId="gid://shopify/Shop/1"
                    ownerType="SHOP"
                    defaultTitle={shopInfo?.title || "Granito Skate Shop - Tienda de skate online"}
                    defaultDescription={
                      shopInfo?.description ||
                      "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas."
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="local" className="space-y-4">
              <LocalBusinessForm />
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <SocialMediaForm />
            </TabsContent>

            <TabsContent value="structured" className="space-y-4">
              <StructuredDataGenerator />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
