"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { shopifyConfig } from "@/lib/config/shopify"

export function ShopifyCredentialsForm() {
  const router = useRouter()
  const [shopDomain, setShopDomain] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [status, setStatus] = useState<{
    success?: boolean
    message?: string
  }>({})
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean
    message?: string
    data?: any
  }>({})

  // Cargar valores actuales al montar el componente
  useEffect(() => {
    setShopDomain(shopifyConfig.shopDomain || "")
    // No mostramos el token por seguridad, pero indicamos si está configurado
    setAccessToken(shopifyConfig.accessToken ? "••••••••••••••••••••••••••••••" : "")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({})

    try {
      const response = await fetch("/api/shopify/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopDomain,
          accessToken: accessToken && !accessToken.includes("•") ? accessToken : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          success: true,
          message: data.message || "Credenciales actualizadas correctamente",
        })

        // Probar la conexión después de actualizar las credenciales
        testConnection()

        // Recargar la página después de 2 segundos para aplicar los cambios
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        setStatus({
          success: false,
          message: data.message || "Error al actualizar las credenciales",
        })
      }
    } catch (error) {
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus({})

    try {
      const response = await fetch("/api/shopify/test-connection", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      setConnectionStatus({
        success: data.success,
        message: data.message || (data.success ? "Conexión exitosa" : "Error de conexión"),
        data: data.data,
      })
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al probar la conexión",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuración de Shopify</CardTitle>
        <CardDescription>Actualiza tus credenciales de Shopify para conectar con tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopDomain">Dominio de la tienda</Label>
            <Input
              id="shopDomain"
              placeholder="tu-tienda.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Ejemplo: tu-tienda.myshopify.com (sin https://)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Token de acceso</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="shpat_..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Puedes generar un token de acceso en tu panel de Shopify: Aplicaciones &gt; Desarrollar aplicaciones &gt;
              Crear una aplicación
            </p>
            <a
              href="https://shopify.dev/docs/apps/auth/admin-app-access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center mt-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Cómo generar un token de acceso
            </a>
          </div>

          {status.message && (
            <Alert variant={status.success ? "default" : "destructive"}>
              {status.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{status.success ? "Éxito" : "Error"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar credenciales"
            )}
          </Button>
        </form>

        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={testConnection}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Probando conexión...
              </>
            ) : (
              "Probar conexión"
            )}
          </Button>

          {connectionStatus.message && (
            <Alert
              variant={connectionStatus.success ? "default" : "destructive"}
              className={`mt-4 ${connectionStatus.success ? "bg-green-50 border-green-200" : ""}`}
            >
              {connectionStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{connectionStatus.success ? "Conexión exitosa" : "Error de conexión"}</AlertTitle>
              <AlertDescription>
                {connectionStatus.message}
                {connectionStatus.success && connectionStatus.data && connectionStatus.data.shop && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Información de la tienda:</p>
                    <ul className="list-disc pl-5 text-sm mt-1">
                      <li>Nombre: {connectionStatus.data.shop.name}</li>
                      {connectionStatus.data.shop.url && <li>URL: {connectionStatus.data.shop.url}</li>}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Estas credenciales se guardarán de forma segura en las variables de entorno de tu aplicación.</p>
      </CardFooter>
    </Card>
  )
}
