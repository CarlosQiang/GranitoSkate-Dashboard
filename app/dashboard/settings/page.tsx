"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShopifyApiStatus } from "@/components/shopify-api-status"
import { checkShopifyEnvVars } from "@/lib/shopify"
import { AlertCircle, CheckCircle, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [shopifySettings, setShopifySettings] = useState({
    shopDomain: "",
    accessToken: "",
  })
  const [envStatus, setEnvStatus] = useState({ isValid: false, missingVars: [] })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Intentar obtener las variables de entorno actuales
    const envCheck = checkShopifyEnvVars()
    setEnvStatus(envCheck)

    // Si están disponibles, mostrarlas en el formulario
    if (envCheck.shopDomain) {
      setShopifySettings((prev) => ({ ...prev, shopDomain: envCheck.shopDomain }))
    }

    // No mostramos el token por seguridad, solo si existe o no
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // En un entorno real, esto enviaría los datos a una API para guardarlos
      // como variables de entorno en el servidor

      // Simulamos una operación exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Configuración guardada",
        description:
          "La configuración de Shopify se ha guardado correctamente. Reinicia la aplicación para aplicar los cambios.",
      })

      // Actualizar el estado de las variables de entorno
      setEnvStatus({
        isValid: true,
        missingVars: [],
        shopDomain: shopifySettings.shopDomain,
        accessToken: "********",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu aplicación</p>
      </div>

      <Tabs defaultValue="shopify">
        <TabsList>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="shopify" className="space-y-4">
          <ShopifyApiStatus />

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Shopify</CardTitle>
              <CardDescription>Configura la conexión con la API de Shopify para gestionar tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-domain">Dominio de la tienda</Label>
                <Input
                  id="shop-domain"
                  placeholder="tu-tienda.myshopify.com"
                  value={shopifySettings.shopDomain}
                  onChange={(e) => setShopifySettings({ ...shopifySettings, shopDomain: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  El dominio de tu tienda Shopify, sin https:// (ej: tu-tienda.myshopify.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-token">Token de acceso</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder={envStatus.accessToken ? "••••••••" : "shpat_..."}
                  value={shopifySettings.accessToken}
                  onChange={(e) => setShopifySettings({ ...shopifySettings, accessToken: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Token de acceso a la API de Shopify. Puedes generarlo en tu panel de administración de Shopify.
                </p>
              </div>

              <Alert className="mt-4" variant={envStatus.isValid ? "default" : "warning"}>
                {envStatus.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {envStatus.isValid ? "Variables configuradas" : "Variables de entorno faltantes"}
                </AlertTitle>
                <AlertDescription>
                  {envStatus.isValid ? (
                    "Las variables de entorno para Shopify están correctamente configuradas."
                  ) : (
                    <div>
                      <p>Faltan las siguientes variables de entorno:</p>
                      <ul className="list-disc pl-5 mt-2">
                        {envStatus.missingVars.map((variable) => (
                          <li key={variable}>{variable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar estado
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar configuración
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Para que los cambios en las variables de entorno surtan efecto, es necesario reiniciar la aplicación o
              volver a desplegarla.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración general</CardTitle>
              <CardDescription>Configura los ajustes generales de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Configuración general de la aplicación (en desarrollo)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
