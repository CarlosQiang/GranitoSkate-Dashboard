"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface ProductSyncResult {
  created: number
  updated: number
  failed: number
  total: number
}

export function ProductSyncButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ProductSyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/sync/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al sincronizar productos")
      }

      setResult(data.result)
      setLastSyncTime(new Date().toLocaleString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sincronización de Productos</CardTitle>
        <CardDescription>Sincroniza los productos de tu tienda Shopify con la base de datos local.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Este proceso importará todos los productos de Shopify a la base de datos local, incluyendo sus variantes,
            imágenes y metadatos. Dependiendo de la cantidad de productos, este proceso puede tardar varios minutos.
          </p>

          <Button onClick={handleSync} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando productos...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Productos con Shopify
              </>
            )}
          </Button>

          {isLoading && (
            <div className="mt-4">
              <Progress value={undefined} className="h-2" />
              <p className="text-xs text-center mt-2 text-gray-500">Este proceso puede tardar varios minutos...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4 space-y-2">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-700">Sincronización completada</AlertTitle>
                <AlertDescription className="text-green-600">
                  Se han sincronizado {result.total} productos.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="text-sm text-gray-500">Creados</p>
                  <p className="text-xl font-bold text-green-600">{result.created}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-md text-center">
                  <p className="text-sm text-gray-500">Actualizados</p>
                  <p className="text-xl font-bold text-blue-600">{result.updated}</p>
                </div>
                <div className="bg-red-50 p-2 rounded-md text-center">
                  <p className="text-sm text-gray-500">Fallidos</p>
                  <p className="text-xl font-bold text-red-600">{result.failed}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {lastSyncTime && (
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Última sincronización: {lastSyncTime}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
