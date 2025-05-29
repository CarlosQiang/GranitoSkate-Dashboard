"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, RefreshCw, CheckCircle, XCircle, Trash2 } from "lucide-react"

interface SyncResult {
  borrados?: number
  insertados: number
  errores: number
  detalles: string[]
}

interface SyncOrdersOnlyProps {
  onSyncComplete?: () => void
}

export function SyncOrdersOnly({ onSyncComplete }: SyncOrdersOnlyProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleReplaceOrders = async () => {
    setIsSyncing(true)
    setResult(null)
    setMessage(null)
    setIsSuccess(null)

    try {
      // Obtener datos del dashboard
      console.log("🔍 Obteniendo datos del dashboard...")
      const dashboardResponse = await fetch("/api/dashboard/summary")

      if (!dashboardResponse.ok) {
        throw new Error("Error al obtener datos del dashboard")
      }

      const dashboardData = await dashboardResponse.json()

      if (!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) {
        throw new Error("No hay pedidos disponibles para sincronizar")
      }

      // Reemplazar pedidos
      console.log("🔄 Iniciando reemplazo completo de pedidos...")
      const syncResponse = await fetch("/api/sync/orders-replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orders: dashboardData.recentOrders,
        }),
      })

      const syncResult = await syncResponse.json()

      if (syncResponse.ok) {
        setResult(syncResult.results)
        setMessage(syncResult.message)
        setIsSuccess(true)
        console.log("✅ Reemplazo completado:", syncResult)

        setTimeout(() => {
          onSyncComplete?.()
        }, 1000)
      } else {
        setMessage(`❌ Error: ${syncResult.message}`)
        setIsSuccess(false)
        console.error("❌ Error en reemplazo:", syncResult)
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
          <ShoppingBag className="h-5 w-5" />
          Reemplazo Completo de Pedidos
        </CardTitle>
        <CardDescription>
          Borra TODOS los pedidos existentes y los reemplaza con los datos actuales de Shopify
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <strong>¡Atención!</strong>
            </div>
            <p className="mt-1">Esta acción borrará TODOS los pedidos existentes en la base de datos.</p>
          </div>

          <Button onClick={handleReplaceOrders} disabled={isSyncing} className="w-full" variant="destructive">
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reemplazando pedidos...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Borrar y Reemplazar Pedidos
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
              <h4 className="font-medium">Resultados del reemplazo:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {result.borrados !== undefined && (
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-bold text-red-600">{result.borrados}</div>
                    <div className="text-red-600">Borrados</div>
                  </div>
                )}
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{result.insertados}</div>
                  <div className="text-green-600">Insertados</div>
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
