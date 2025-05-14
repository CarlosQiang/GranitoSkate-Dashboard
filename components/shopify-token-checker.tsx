"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Key } from "lucide-react"
import { Label } from "@/components/ui/label"

export function ShopifyTokenChecker() {
  const [token, setToken] = useState("")
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkToken = async () => {
    if (!token.trim()) {
      setError("Por favor, introduce un token de acceso")
      return
    }

    try {
      setChecking(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/shopify/check-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      setResult(data)
    } catch (err) {
      console.error("Error al verificar token:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Verificar Token de Shopify
        </CardTitle>
        <CardDescription>Verifica si el token de acceso de Shopify tiene los permisos necesarios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopify-token">Token de acceso de Shopify</Label>
            <Input
              id="shopify-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="shpat_..."
              type="password"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Puedes obtener un nuevo token de acceso en la sección de Apps de tu panel de administración de Shopify.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Token válido" : "Token inválido"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {result?.success && result?.scopes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Permisos del token:</h4>
              <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">{result.scopes.join(", ")}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkToken} disabled={checking} className="w-full">
          {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {checking ? "Verificando..." : "Verificar Token"}
        </Button>
      </CardFooter>
    </Card>
  )
}
