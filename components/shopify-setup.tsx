"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ShopifySetup() {
  const [shopDomain, setShopDomain] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    success?: boolean
    message?: string
  }>({})

  // Cargar valores actuales de las variables de entorno
  useEffect(() => {
    const loadEnvVars = async () => {
      try {
        const response = await fetch("/api/shopify/get-credentials")
        const data = await response.json()

        if (data.shopDomain) {
          setShopDomain(data.shopDomain)
        }

        // No mostramos el token por seguridad, solo indicamos si está configurado
        if (data.hasAccessToken) {
          setAccessToken("••••••••••••••••••••••••••••••")
        }
      } catch (error) {
        console.error("Error al cargar credenciales:", error)
      }
    }

    loadEnvVars()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({})

    try {
      // Validar que los campos no estén vacíos
      if (!shopDomain) {
        setStatus({
          success: false,
          message: "El dominio de la tienda es obligatorio",
        })
        setIsLoading(false)
        return
      }

      if (!accessToken || accessToken === "••••••••••••••••••••••••••••••") {
        setStatus({
          success: false,
          message: "El token de acceso es obligatorio",
        })
        setIsLoading(false)
        return
      }

      // Limpiar el dominio si el usuario incluyó https:// o la parte final
      let cleanDomain = shopDomain
      if (cleanDomain.startsWith("https://")) {
        cleanDomain = cleanDomain.substring(8)
      }
      if (cleanDomain.includes("/")) {
        cleanDomain = cleanDomain.split("/")[0]
      }

      const response = await fetch("/api/shopify/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopDomain: cleanDomain,
          accessToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          success: true,
          message: data.message || "Credenciales actualizadas correctamente",
        })

        // Recargar la página después de 2 segundos para aplicar los cambios
        setTimeout(() => {
          window.location.reload()
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuración de Shopify</CardTitle>
        <CardDescription>Configura tus credenciales de Shopify para conectar con tu tienda</CardDescription>
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
                Verificando...
              </>
            ) : (
              "Guardar y verificar"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Estas credenciales se guardarán de forma segura en las variables de entorno de tu aplicación.</p>
      </CardFooter>
    </Card>
  )
}
