"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Globe, Code, AlertCircle } from "lucide-react"
import { SeoForm } from "@/components/seo-form"
import { LocalBusinessForm } from "@/components/local-business-form"
import { SocialMediaForm } from "@/components/social-media-form"
import { StructuredDataGenerator } from "@/components/structured-data-generator"
// Añadir indicadores de carga para mejorar la experiencia del usuario
import { Skeleton } from "@/components/ui/skeleton"

// Modificar el componente para incluir estado de carga
export default function SeoPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)

  // Añadir esta función para simular carga al cambiar de pestaña
  const handleTabChange = (value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
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
                    defaultTitle="Granito Skate Shop - Tienda de skate online"
                    defaultDescription="Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas."
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
