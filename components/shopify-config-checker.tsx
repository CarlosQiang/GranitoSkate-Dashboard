"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ShopifyConfigChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle")
  const [shopInfo, setShopInfo] = useState<any>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState({
    shopDomain: "",
    accessToken: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Cargar valores actuales
    const loadCurrentValues = async () => {
      try {
        const response = await fetch("/api/shopify/config-check")
        const data = await response.json()

        if (data.config) {
          setConfigValues({
            shopDomain: data.config.shopDomain || "",
            accessToken: data.config.accessToken || "",
          })
        }
      } catch (error) {
        console.error("Error al cargar la configuración actual:", error)
      }
    }

    loadCurrentValues()
  }, [])

  const checkConnection = async () => {
    setIsChecking(true)
    setStatus("checking")
    setErrorDetails(null)

    try {
      const response = await fetch("/api/shopify")
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setShopInfo(data.shop)
        toast({
          title: "Conexión exitosa",
          description: `Conectado a la tienda ${data.shop?.name || "Shopify"}`,
        })
      } else {
        setStatus("error")
        setErrorDetails(data.error || "Error desconocido al conectar con Shopify")
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: data.error || "Error desconocido al conectar con Shopify",
        })
      }
    } catch (error) {
      setStatus("error")
      setErrorDetails(error instanceof Error ? error.message : "Error desconocido")
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo verificar la conexión con Shopify",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/shopify/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configValues),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Configuración guardada",
          description: "Las credenciales de Shopify se han actualizado correctamente",
        })

        // Verificar la conexión con las nuevas credenciales
        await checkConnection()
      } else {
        toast({
          variant: "destructive",
          title: "Error al guardar",
          description: data.error || "No se pudieron guardar las credenciales",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Ocurrió un error al guardar las credenciales",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuración de Shopify
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
        <CardDescription>Verifica y actualiza la conexión con tu tienda Shopify</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "error" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              {errorDetails || "No se pudo conectar con Shopify. Verifica tus credenciales."}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Conexión exitosa</AlertTitle>
            <AlertDescription className="text-green-600">
              Conectado correctamente a la tienda {shopInfo?.name || "Shopify"}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopDomain">Dominio de la tienda</Label>
            <Input
              id="shopDomain"
              placeholder="tu-tienda.myshopify.com"
              value={configValues.shopDomain}
              onChange={(e) => setConfigValues({ ...configValues, shopDomain: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              El dominio de tu tienda Shopify (ej: tu-tienda.myshopify.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Token de acceso</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="shpat_..."
              value={configValues.accessToken}
              onChange={(e) => setConfigValues({ ...configValues, accessToken: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Token de acceso a la API de Shopify (comienza con shpat_)</p>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-medium mb-2">Estado actual de las variables de entorno:</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</span>
                <Badge variant={process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "Configurado" : "No configurado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SHOPIFY_ACCESS_TOKEN</span>
                <Badge variant={process.env.SHOPIFY_ACCESS_TOKEN ? "default" : "destructive"}>
                  {process.env.SHOPIFY_ACCESS_TOKEN ? "Configurado" : "No configurado"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkConnection} disabled={isChecking}>
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar conexión
            </>
          )}
        </Button>

        <Button onClick={saveConfig} disabled={isSaving}>
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
  )
}
