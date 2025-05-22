"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, CheckCircle, ExternalLink } from "lucide-react"
import { LoadingState } from "@/components/loading-state"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function ShopifyConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "hidden">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [shopName, setShopName] = useState<string | null>(null)
  const [shopDomain, setShopDomain] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [missingVars, setMissingVars] = useState<string[]>([])

  async function checkConnection() {
    setIsChecking(true)
    setStatus("loading")

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

      if (data.success) {
        setStatus("connected")
        setShopName(data.shop?.name || "Tienda Shopify")
        setShopDomain(data.shop?.primaryDomain?.url || process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN)
        setErrorDetails(null)
        setMissingVars([])
      } else {
        setStatus("error")
        setErrorDetails(data.error || "Error desconocido al conectar con Shopify")

        // Verificar variables de entorno faltantes
        const missingEnvVars = []
        if (data.env) {
          if (data.env.SHOPIFY_API_URL === "No configurado") missingEnvVars.push("SHOPIFY_API_URL")
          if (data.env.SHOPIFY_ACCESS_TOKEN === "No configurado") missingEnvVars.push("SHOPIFY_ACCESS_TOKEN")
          if (data.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN === "No configurado")
            missingEnvVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
        }
        setMissingVars(missingEnvVars)
      }
    } catch (error) {
      console.error("Error al verificar la conexión con Shopify:", error)
      setStatus("error")
      setErrorDetails((error as Error).message || "Error de conexión")
      setMissingVars([])
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "connected" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          Conexión a Shopify
        </CardTitle>
        <CardDescription>Verifica la conexión con la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex items-center justify-center p-4">
            <LoadingState message="Verificando conexión con Shopify..." />
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">Error de conexión con Shopify</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              <p>No se pudo conectar con la API de Shopify. Por favor, verifica:</p>
              <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
                {missingVars.length > 0 ? (
                  missingVars.map((variable, index) => (
                    <li key={index}>
                      La variable de entorno <strong>{variable}</strong> no está configurada
                    </li>
                  ))
                ) : (
                  <>
                    <li>Que el dominio de la tienda (NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) sea correcto</li>
                    <li>Que el token de acceso (SHOPIFY_ACCESS_TOKEN) sea válido y tenga los permisos necesarios</li>
                    <li>Que la tienda esté activa y accesible</li>
                  </>
                )}
              </ul>
              {errorDetails && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs sm:text-sm font-mono overflow-auto max-h-32">
                  {errorDetails}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "connected" && (
          <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-sm sm:text-base">Conectado a Shopify</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              <p>
                Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
              </p>
              {shopDomain && (
                <div className="mt-2">
                  <Link
                    href={shopDomain.startsWith("http") ? shopDomain : `https://${shopDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Visitar tienda <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} disabled={isChecking} variant="outline" className="w-full">
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
      </CardFooter>
    </Card>
  )
}
