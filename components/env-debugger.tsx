"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Bug, RefreshCw } from "lucide-react"

export function EnvDebugger() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEnvInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug/env")
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setEnvInfo(data.envInfo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error al obtener información de variables de entorno:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvInfo()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depurador de Variables de Entorno</CardTitle>
        <CardDescription>Información sobre las variables de entorno configuradas en el servidor</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : envInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Variable</div>
              <div className="font-semibold">Estado</div>

              <div>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</div>
              <div className={envInfo.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.configured ? "text-green-600" : "text-red-600"}>
                {envInfo.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.configured
                  ? envInfo.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.value
                  : "No configurado"}
              </div>

              <div>SHOPIFY_ACCESS_TOKEN</div>
              <div className={envInfo.SHOPIFY_ACCESS_TOKEN.configured ? "text-green-600" : "text-red-600"}>
                {envInfo.SHOPIFY_ACCESS_TOKEN.configured ? "Configurado" : "No configurado"}
              </div>

              <div>NODE_ENV</div>
              <div>{envInfo.NODE_ENV || "No definido"}</div>

              <div>VERCEL_ENV</div>
              <div>{envInfo.VERCEL_ENV || "No definido"}</div>

              <div>VERCEL_URL</div>
              <div>{envInfo.VERCEL_URL || "No definido"}</div>

              <div>NEXT_PUBLIC_VERCEL_URL</div>
              <div>{envInfo.NEXT_PUBLIC_VERCEL_URL || "No definido"}</div>
            </div>

            <Alert>
              <AlertTitle>Información del cliente</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <div>
                    <strong>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN:</strong>{" "}
                    {process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "No disponible en el cliente"}
                  </div>
                  <div>
                    <strong>window.location:</strong>{" "}
                    {typeof window !== "undefined" ? window.location.href : "No disponible"}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="text-center p-4">No hay información disponible</div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchEnvInfo} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <Bug className="mr-2 h-4 w-4" />
              Actualizar información
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
