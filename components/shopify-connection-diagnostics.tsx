"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, RefreshCw, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function ShopifyConnectionDiagnostics() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)

  const runDiagnostics = async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      // Añadir un parámetro de timestamp para evitar caché
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/shopify/diagnostics?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setData(result)
      } else {
        setStatus("error")
        setError(result.message || "Error desconocido en el diagnóstico")
        setData(result)
      }
    } catch (err) {
      console.error("Error al ejecutar diagnósticos:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Correcto
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Advertencia
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Desconocido
          </Badge>
        )
    }
  }

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Diagnóstico de conexión a Shopify
          </CardTitle>
          <CardDescription>Verificando la conexión con la API de Shopify...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Ejecutando diagnóstico...
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Error en el diagnóstico de Shopify
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {data && data.details && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Detalles técnicos:</h4>
              <pre className="bg-red-50 p-3 rounded text-xs overflow-auto max-h-32 text-red-800">
                {typeof data.details === "object" ? JSON.stringify(data.details, null, 2) : data.details}
              </pre>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Sugerencias:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Verifica que las variables de entorno estén configuradas correctamente</li>
                <li>Asegúrate de que el token de acceso a Shopify sea válido</li>
                <li>Comprueba que el dominio de la tienda sea correcto</li>
                <li>Verifica la conectividad de red</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={runDiagnostics} disabled={isChecking} className="w-full sm:w-auto">
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reintentando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar diagnóstico
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-green-200">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          Conexión a Shopify establecida
        </CardTitle>
        <CardDescription className="text-green-600">
          La conexión con la API de Shopify está funcionando correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {data && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Información de la tienda:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.shopInfo && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Nombre:</span>
                      <span className="text-sm">{data.shopInfo.name}</span>
                    </div>
                    {data.shopInfo.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">ID:</span>
                        <span className="text-sm">{data.shopInfo.id}</span>
                      </div>
                    )}
                    {data.shopInfo.url && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">URL:</span>
                        <span className="text-sm">{data.shopInfo.url}</span>
                      </div>
                    )}
                    {data.shopInfo.domain && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Dominio:</span>
                        <span className="text-sm">{data.shopInfo.domain}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {data.apiStatus && (
              <div>
                <h4 className="text-sm font-medium mb-2">Estado de la API:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Versión:</span>
                    <span className="text-sm">{data.apiStatus.version || "No disponible"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Estado:</span>
                    {renderStatusBadge(data.apiStatus.status || "unknown")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Latencia:</span>
                    <span className="text-sm">
                      {data.apiStatus.latency ? `${data.apiStatus.latency}ms` : "No disponible"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Última verificación:</span>
                    <span className="text-sm">
                      {data.timestamp ? new Date(data.timestamp).toLocaleString() : "No disponible"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {data.endpoints && (
              <div>
                <h4 className="text-sm font-medium mb-2">Endpoints verificados:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(data.endpoints).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{key}</span>
                      {renderStatusBadge(value.status || "unknown")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={runDiagnostics} disabled={isChecking} className="w-full sm:w-auto">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar diagnóstico
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
