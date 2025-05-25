"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, Copy, ExternalLink, Settings, Database, ShoppingBag, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [shopDomain, setShopDomain] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [envVarsStatus, setEnvVarsStatus] = useState<any>(null)
  const { toast } = useToast()

  // Verificar variables de entorno al cargar
  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = async () => {
    try {
      const response = await fetch("/api/system/config-check")
      const data = await response.json()
      setEnvVarsStatus(data)
    } catch (error) {
      console.error("Error checking environment variables:", error)
    }
  }

  const testShopifyConnection = async () => {
    if (!shopDomain || !accessToken) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    try {
      const response = await fetch("/api/shopify/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopDomain: shopDomain.replace(".myshopify.com", ""),
          accessToken,
        }),
      })

      const result = await response.json()
      setConnectionStatus(result)

      if (result.success) {
        toast({
          title: "¡Conexión exitosa!",
          description: `Conectado con ${result.data?.shop?.name || "tu tienda"}`,
        })
      } else {
        toast({
          title: "Error de conexión",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo probar la conexión",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground">Configura las integraciones necesarias para el funcionamiento completo</p>
      </div>

      {/* Estado general del sistema */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Datos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {envVarsStatus?.database ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurada
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                No configurada
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shopify</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {envVarsStatus?.shopify ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                No configurado
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autenticación</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {envVarsStatus?.auth ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurada
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                No configurada
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Shopify */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Configuración de Shopify
          </CardTitle>
          <CardDescription>Conecta tu tienda de Shopify para gestionar productos, pedidos y clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instrucciones */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pasos para configurar Shopify:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Ve a tu panel de administración de Shopify</li>
                <li>Navega a "Aplicaciones" → "Desarrollo de aplicaciones"</li>
                <li>Crea una aplicación privada o usa una existente</li>
                <li>Copia el dominio de tu tienda y el token de acceso</li>
                <li>Pega los valores aquí y prueba la conexión</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Formulario de configuración */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shopDomain">Dominio de la tienda</Label>
              <Input
                id="shopDomain"
                placeholder="mi-tienda.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Solo el nombre, sin "https://" ni ".myshopify.com"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Token de acceso</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="shpat_..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Token de acceso de la aplicación privada</p>
            </div>
          </div>

          {/* Botón de prueba */}
          <Button onClick={testShopifyConnection} disabled={isTestingConnection} className="w-full">
            {isTestingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Probando conexión...
              </>
            ) : (
              "Probar conexión"
            )}
          </Button>

          {/* Resultado de la prueba */}
          {connectionStatus && (
            <Alert variant={connectionStatus.success ? "default" : "destructive"}>
              {connectionStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                <strong>{connectionStatus.success ? "¡Éxito!" : "Error:"}</strong> {connectionStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Variables de entorno para Vercel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Variables de entorno para Vercel</h3>
            <p className="text-sm text-muted-foreground">
              Añade estas variables en tu panel de Vercel para que la aplicación funcione correctamente:
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <code className="text-sm font-mono">NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</code>
                  <p className="text-xs text-muted-foreground mt-1">{shopDomain || "tu-tienda"}.myshopify.com</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(shopDomain ? `${shopDomain}.myshopify.com` : "tu-tienda.myshopify.com")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <code className="text-sm font-mono">SHOPIFY_ACCESS_TOKEN</code>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accessToken ? "shpat_••••••••••••••••" : "Tu token de acceso"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(accessToken || "tu-token-de-acceso")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Enlaces útiles */}
          <div className="space-y-2">
            <h4 className="font-medium">Enlaces útiles:</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://help.shopify.com/en/manual/apps/private-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Crear aplicación privada
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Panel de Vercel
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de la base de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de la Base de Datos
          </CardTitle>
          <CardDescription>Información sobre la conexión a la base de datos</CardDescription>
        </CardHeader>
        <CardContent>
          {envVarsStatus?.database ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Base de datos configurada correctamente</strong>
                <br />
                La conexión a PostgreSQL está funcionando. Todas las tablas están creadas y listas para usar.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Base de datos no configurada</strong>
                <br />
                Configura las variables de entorno de PostgreSQL en Vercel para continuar.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
