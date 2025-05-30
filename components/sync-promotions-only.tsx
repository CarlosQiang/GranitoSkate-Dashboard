"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface SyncResult {
  borrados: number
  insertados: number
  errores: number
  detalles: string[]
}

interface SyncPromotionsOnlyProps {
  onSyncComplete?: () => void
}

export function SyncPromotionsOnly({ onSyncComplete }: SyncPromotionsOnlyProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🔄 Iniciando reemplazo completo de promociones...")

      const response = await fetch("/api/sync/promotions-replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Reemplazo completado:", data)

      setResult(data.results)
      onSyncComplete?.()
    } catch (error) {
      console.error("❌ Error en reemplazo:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Reemplazo Completo de Promociones
        </CardTitle>
        <CardDescription>
          Borra TODAS las promociones existentes y las reemplaza con los datos actuales de Shopify
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">¡Atención!</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Esta acción borrará TODAS las promociones existentes en la base de datos.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSync} disabled={isLoading} className="w-full" variant="destructive">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Borrar y Reemplazar Promociones
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    Reemplazo completado: {result.borrados} borradas, {result.insertados} insertadas, {result.errores}{" "}
                    errores
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Resultados del reemplazo:</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.borrados}</div>
                    <div className="text-sm text-red-600">Borradas</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.insertados}</div>
                    <div className="text-sm text-green-600">Insertadas</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.errores}</div>
                    <div className="text-sm text-red-600">Errores</div>
                  </div>
                </div>

                {result.detalles.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Detalles:</h5>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {result.detalles.map((detalle, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {detalle}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
