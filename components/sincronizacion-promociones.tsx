"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Tag, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface SyncPromotionsProps {
  onSyncComplete?: () => void
}

export function SyncPromotionsOnly({ onSyncComplete }: SyncPromotionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<{
    total?: number
    insertados?: number
    borrados?: number
    errores?: number
  }>({})
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    setProgress(0)
    setStatus("Iniciando sincronización de promociones...")
    setError(null)
    setSuccess(false)
    setResult({})

    try {
      // Paso 1: Obtener promociones de Shopify
      setProgress(10)
      setStatus("Obteniendo promociones desde Shopify...")

      const shopifyResponse = await fetch("/api/shopify/promotions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!shopifyResponse.ok) {
        const errorData = await shopifyResponse.json()
        throw new Error(errorData.error || `Error HTTP: ${shopifyResponse.status}`)
      }

      const shopifyData = await shopifyResponse.json()
      const promociones = shopifyData.promociones || []

      setProgress(40)
      setStatus(`Se encontraron ${promociones.length} promociones en Shopify...`)

      // Paso 2: Sincronizar con la base de datos local (reemplazar estrategia)
      setProgress(60)
      setStatus("Sincronizando promociones con la base de datos local...")

      const syncResponse = await fetch("/api/sync/promotions-replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promociones }),
      })

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json()
        throw new Error(errorData.error || `Error HTTP: ${syncResponse.status}`)
      }

      const syncResult = await syncResponse.json()
      console.log("Resultado de sincronización:", syncResult)

      setProgress(100)
      setStatus(`Sincronización completada. ${syncResult.results?.insertados || 0} promociones sincronizadas.`)
      setSuccess(true)
      setResult({
        total: promociones.length,
        insertados: syncResult.results?.insertados || 0,
        borrados: syncResult.results?.borrados || 0,
        errores: syncResult.results?.errores || 0,
      })

      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${syncResult.results?.insertados || 0} promociones correctamente.`,
      })

      // Llamar al callback si existe
      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (err) {
      console.error("Error en la sincronización:", err)
      setError(err instanceof Error ? err.message : "Error desconocido durante la sincronización")

      toast({
        variant: "destructive",
        title: "Error de sincronización",
        description: err instanceof Error ? err.message : "Error desconocido durante la sincronización",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-xl">Sincronización de Promociones</CardTitle>
          </div>
          {result.total && result.total > 0 && (
            <Badge variant="outline" className="ml-2">
              {result.total} promociones
            </Badge>
          )}
        </div>
        <CardDescription>
          Sincroniza las promociones y descuentos desde Shopify a la base de datos local
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{status}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error de sincronización</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && !isLoading && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Sincronización completada</h3>
                  <p className="mt-1 text-sm text-green-700">{status}</p>

                  {result.insertados !== undefined && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div className="flex flex-col items-center p-2 bg-green-100 rounded">
                        <span className="font-medium">{result.insertados}</span>
                        <span className="text-xs text-green-800">Insertados</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-amber-100 rounded">
                        <span className="font-medium">{result.borrados || 0}</span>
                        <span className="text-xs text-amber-800">Borrados</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-red-100 rounded">
                        <span className="font-medium">{result.errores || 0}</span>
                        <span className="text-xs text-red-800">Errores</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Reemplazo de datos</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Esta acción borrará todas las promociones existentes en la base de datos y las reemplazará con las
                  promociones actuales de Shopify.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSync} disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Percent className="mr-2 h-4 w-4" />
              Sincronizar Promociones
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
