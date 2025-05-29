"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, RefreshCw, CheckCircle, XCircle } from "lucide-react"

interface SyncResult {
  insertados: number
  actualizados: number
  errores: number
  detalles: string[]
}

export function SyncProductsOnly() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleSyncProducts = async () => {
    setIsSyncing(true)
    setResult(null)
    setMessage(null)
    setIsSuccess(null)

    try {
      // Primero obtener los datos del dashboard
      console.log("🔍 Obteniendo datos del dashboard...")
      const dashboardResponse = await fetch("/api/dashboard/summary")

      if (!dashboardResponse.ok) {
        throw new Error("Error al obtener datos del dashboard")
      }

      const dashboardData = await dashboardResponse.json()
      console.log("📊 Datos del dashboard obtenidos:", dashboardData)

      if (!dashboardData.allProducts || dashboardData.allProducts.length === 0) {
        throw new Error("No hay productos disponibles para sincronizar")
      }

      // Sincronizar solo productos
      console.log("🔄 Iniciando sincronización de productos...")
      const syncResponse = await fetch("/api/sync/products-only", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: dashboardData.allProducts,
        }),
      })

      const syncResult = await syncResponse.json()

      if (syncResponse.ok) {
        setResult(syncResult.results)
        setMessage(syncResult.message)
        setIsSuccess(true)
        console.log("✅ Sincronización completada:", syncResult)
      } else {
        setMessage(`❌ Error: ${syncResult.message}`)
        setIsSuccess(false)
        console.error("❌ Error en sincronización:", syncResult)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setMessage(`❌ Error: ${errorMessage}`)
      setIsSuccess(false)
      console.error("❌ Error general:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Sincronización de Productos (Solo)
        </CardTitle>
        <CardDescription>Sincronizar únicamente los productos desde Shopify a la base de datos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleSyncProducts} disabled={isSyncing} className="w-full">
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando productos...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Sincronizar Solo Productos
              </>
            )}
          </Button>

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                isSuccess
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {message}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados de la sincronización:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{result.insertados}</div>
                  <div className="text-green-600">Insertados</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{result.actualizados}</div>
                  <div className="text-blue-600">Actualizados</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-bold text-red-600">{result.errores}</div>
                  <div className="text-red-600">Errores</div>
                </div>
              </div>

              {result.detalles.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Detalles:</h5>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {result.detalles.map((detalle, index) => (
                      <div key={index} className="p-1 bg-gray-50 rounded">
                        {detalle}
                      </div>
                    ))}
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
