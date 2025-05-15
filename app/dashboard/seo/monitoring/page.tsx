"use client"

import { useState } from "react"
import { SeoApiStatus } from "@/components/seo-api-status"
import { SeoMonitoringDashboard } from "@/components/seo-monitoring-dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowRight, BarChart2, LineChart, Settings } from "lucide-react"

export default function SeoMonitoringPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const shopId = "gid://shopify/Shop/1"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitorización SEO</h1>
        <p className="text-muted-foreground">Monitoriza el rendimiento SEO de tu tienda y analiza las tendencias</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <SeoApiStatus checkEndpoint="/api/seo/check" refreshInterval={300000} />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conectar Google Search Console</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conecta tu cuenta de Google Search Console para obtener datos reales de rendimiento SEO.
            </p>
            <Button className="w-full">
              Conectar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Datos de demostración</AlertTitle>
        <AlertDescription className="text-blue-700">
          Actualmente estás viendo datos de demostración. Conecta Google Search Console para ver datos reales.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart2 className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports">
            <LineChart className="mr-2 h-4 w-4" />
            Informes
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SeoMonitoringDashboard shopId={shopId} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informes SEO</CardTitle>
              <CardDescription>Genera informes personalizados sobre el rendimiento SEO de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta funcionalidad estará disponible próximamente. Conecta Google Search Console para habilitar los
                informes personalizados.
              </p>
              <Button disabled>Generar informe</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de monitorización</CardTitle>
              <CardDescription>Configura las opciones de monitorización SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta funcionalidad estará disponible próximamente. Podrás configurar alertas, informes automáticos y
                más.
              </p>
              <Button disabled>Guardar configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
