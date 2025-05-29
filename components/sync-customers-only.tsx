"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Users, Trash2 } from "lucide-react"

interface SyncResult {
  borrados: number
  insertados: number
  errores: number
  detalles: string[]
}

interface SyncCustomersOnlyProps {
  onSyncComplete?: () => void
}

export function SyncCustomersOnly({ onSyncComplete }: SyncCustomersOnlyProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🔄 Iniciando reemplazo completo de clientes...")

      const response = await fetch("/api/sync/customers-replace", {
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
      console.log("✅ Reemplazo de clientes completado:", data)

      setResult({
        borrados: data.borrados || 0,
        insertados: data.insertados || 0,
        errores: data.errores?.length || 0,
        detalles: data.detalles || [],
      })

      // Llamar al callback para actualizar el estado
      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error("❌ Error en reemplazo de clientes:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Reemplazo Completo de Clientes
        </CardTitle>
        <CardDescription>
          Borra TODOS los clientes existentes y los reemplaza con los datos actuales de Shopify
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">¡Atención!</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Esta acción borrará TODOS los clientes existentes en la base de datos y los reemplazará con los datos
                  actuales de Shopify.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSync} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar y Reemplazar Clientes
            </>
          )}
        </Button>

        {result && (
          <div className="mt-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800">
                ✅ Reemplazo completado: {result.borrados} borrados, {result.insertados} insertados, {result.errores}{" "}
                errores
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Resultados del reemplazo:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{result.borrados}</div>
                  <div className="text-sm text-red-600">Borrados</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{result.insertados}</div>
                  <div className="text-sm text-green-600">Insertados</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{result.errores}</div>
                  <div className="text-sm text-red-600">Errores</div>
                </div>
              </div>
            </div>

            {result.detalles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Detalles:</h4>
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs space-y-1">
                  {result.detalles.map((detalle, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {detalle.includes("Error") ? (
                        <span className="text-red-500">❌</span>
                      ) : (
                        <span className="text-green-500">✅</span>
                      )}
                      <span>{detalle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">❌ Error: {error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
