"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, CheckCircle, XCircle } from "lucide-react"

export function TestPromotionsConnection() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      console.log("🧪 Probando conexión de promociones...")

      // Probar endpoint de Shopify
      const shopifyResponse = await fetch("/api/shopify/promotions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const shopifyData = shopifyResponse.ok ? await shopifyResponse.json() : null

      // Probar endpoint de BD local
      const dbResponse = await fetch("/api/db/promociones", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const dbData = dbResponse.ok ? await dbResponse.json() : null

      setResults({
        shopify: {
          status: shopifyResponse.status,
          success: shopifyResponse.ok,
          data: shopifyData,
          count: shopifyData?.promociones?.length || 0,
        },
        database: {
          status: dbResponse.status,
          success: dbResponse.ok,
          data: dbData,
          count: Array.isArray(dbData) ? dbData.length : 0,
        },
      })

      console.log("✅ Prueba de conexión completada:", {
        shopify: shopifyData,
        database: dbData,
      })
    } catch (error) {
      console.error("❌ Error en prueba de conexión:", error)
      setResults({
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Diagnóstico de Promociones
        </CardTitle>
        <CardDescription>
          Prueba la conexión con Shopify y la base de datos para verificar el estado de las promociones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={testConnection} disabled={isLoading} className="w-full">
            {isLoading ? "Probando..." : "🧪 Probar Conexión"}
          </Button>

          {results && (
            <div className="space-y-4">
              {results.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-medium">Error en la prueba</span>
                  </div>
                  <p className="text-red-700 mt-1">{results.error}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Shopify */}
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Shopify API</h3>
                      {getStatusIcon(results.shopify.success)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <Badge variant={results.shopify.success ? "default" : "destructive"}>
                          {results.shopify.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Promociones:</span>
                        <span className="font-medium">{results.shopify.count}</span>
                      </div>
                      {results.shopify.data?.message && (
                        <p className="text-xs text-gray-600">{results.shopify.data.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Base de Datos */}
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Base de Datos</h3>
                      {getStatusIcon(results.database.success)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <Badge variant={results.database.success ? "default" : "destructive"}>
                          {results.database.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Promociones:</span>
                        <span className="font-medium">{results.database.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.shopify?.data?.promociones && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Promociones encontradas en Shopify:</h4>
                  <div className="space-y-1 text-sm">
                    {results.shopify.data.promociones.slice(0, 3).map((promo: any, index: number) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{promo.titulo || promo.title}</span>
                        <span className="text-gray-500">{promo.id}</span>
                      </div>
                    ))}
                    {results.shopify.data.promociones.length > 3 && (
                      <p className="text-gray-500 text-xs">... y {results.shopify.data.promociones.length - 3} más</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
