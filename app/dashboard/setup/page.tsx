"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SetupPage() {
  const [shopDomain, setShopDomain] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  const testConnection = async () => {
    if (!shopDomain || !accessToken) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setConnectionStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/shopify/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopDomain,
          accessToken,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("success")
        toast({
          title: "¡Conexión exitosa!",
          description: `Conectado con ${result.data?.shop?.name || "Shopify"}`,
        })
      } else {
        setConnectionStatus("error")
        setErrorMessage(result.message || "Error desconocido")
        toast({
          title: "Error de conexión",
          description: result.message || "No se pudo conectar con Shopify",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Error de red al probar la conexión")
      toast({
        title: "Error",
        description: "Error de red al probar la conexión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración Inicial</h1>
        <p className="text-muted-foreground">Configura tu conexión con Shopify para comenzar</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Shopify
            </CardTitle>
            <CardDescription>Ingresa las credenciales de tu tienda Shopify para establecer la conexión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopDomain">Dominio de la tienda</Label>
              <Input
                id="shopDomain"
                placeholder="mi-tienda.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                El dominio de tu tienda Shopify (ej: mi-tienda.myshopify.com)
              </p>
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
              <p className="text-xs text-muted-foreground">El token de acceso privado de tu aplicación Shopify</p>
            </div>

            <Button onClick={testConnection} disabled={isLoading} className="w-full">
              {isLoading ? "Probando conexión..." : "Probar conexión"}
            </Button>

            {connectionStatus === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ¡Conexión exitosa! Tu tienda Shopify está configurada correctamente.
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones de configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">1. Crear una aplicación privada en Shopify</h4>
              <p className="text-sm text-muted-foreground">
                Ve a tu panel de administración de Shopify → Aplicaciones → Desarrollar aplicaciones → Crear una
                aplicación privada
              </p>
            </div>

            <div>
              <h4 className="font-medium">2. Configurar permisos</h4>
              <p className="text-sm text-muted-foreground">
                Asegúrate de que tu aplicación tenga permisos de lectura y escritura para productos, pedidos, clientes y
                colecciones
              </p>
            </div>

            <div>
              <h4 className="font-medium">3. Obtener credenciales</h4>
              <p className="text-sm text-muted-foreground">
                Copia el token de acceso de la aplicación y el dominio de tu tienda
              </p>
            </div>

            <div>
              <h4 className="font-medium">4. Variables de entorno</h4>
              <p className="text-sm text-muted-foreground">
                Configura las siguientes variables de entorno en tu proyecto:
              </p>
              <div className="bg-muted p-3 rounded-md mt-2 text-sm font-mono">
                <div>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com</div>
                <div>SHOPIFY_ACCESS_TOKEN=shpat_...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
