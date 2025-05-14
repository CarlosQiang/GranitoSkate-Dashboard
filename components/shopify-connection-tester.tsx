"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ShopifyConnectionTester() {
  const [shopDomain, setShopDomain] = useState(process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "")
  const [accessToken, setAccessToken] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)

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

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setTestResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error al probar la conexión con Shopify:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probar Conexión con Shopify</CardTitle>
        <CardDescription>Prueba la conexión con Shopify utilizando credenciales personalizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopDomain">Dominio de la tienda</Label>
            <Input
              id="shopDomain"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="tu-tienda.myshopify.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Token de acceso</Label>
            <Input
              id="accessToken"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              type="password"
              placeholder="shpat_..."
            />
            <p className="text-xs text-muted-foreground">
              Si dejas este campo vacío, se utilizará el token configurado en las variables de entorno.
            </p>
          </div>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{testResult.success ? "Conexión exitosa" : "Error de conexión"}</AlertTitle>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Probando conexión...
            </>
          ) : (
            "Probar conexión"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
