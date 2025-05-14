"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ShopifyManualConfig() {
  const [shopDomain, setShopDomain] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    success?: boolean
    message?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({})

    try {
      // Guardar las credenciales en localStorage para uso temporal
      localStorage.setItem("shopify_domain", shopDomain)
      localStorage.setItem("shopify_token", accessToken)

      // Intentar una conexión de prueba
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

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus({
          success: true,
          message: data.message || "Conexión exitosa con Shopify",
        })

        // Recargar la página después de 2 segundos para aplicar los cambios
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setStatus({
          success: false,
          message: data.message || "Error al conectar con Shopify",
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
        <CardTitle>Configuración Manual de Shopify</CardTitle>
        <CardDescription>
          Introduce tus credenciales de Shopify para conectar temporalmente con tu tienda
        </CardDescription>
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
        <p>
          Estas credenciales se guardarán temporalmente en tu navegador. Para una configuración permanente, actualiza
          las variables de entorno en Vercel.
        </p>
      </CardFooter>
    </Card>
  )
}
