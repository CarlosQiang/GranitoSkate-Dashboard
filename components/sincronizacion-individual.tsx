"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, RefreshCw, Database } from "lucide-react"

interface SincronizacionIndividualProps {
  tipo: "productos" | "colecciones" | "clientes" | "pedidos"
  titulo: string
  descripcion: string
}

export function SincronizacionIndividual({ tipo, titulo, descripcion }: SincronizacionIndividualProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [syncResult, setSyncResult] = useState<any | null>(null)

  // Obtener elementos de Shopify
  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSyncResult(null)

    try {
      const response = await fetch(`/api/sync/${tipo}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setItems(data.products || data[tipo] || [])
        setSuccess(`Se obtuvieron ${data.count} ${tipo} de Shopify`)
      } else {
        throw new Error(data.error || `Error al obtener ${tipo}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error desconocido al obtener ${tipo}`)
    } finally {
      setLoading(false)
    }
  }

  // Sincronizar un elemento individual
  const syncItem = async (item: any) => {
    setSelectedItem(item)
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSyncResult(null)

    try {
      const response = await fetch(`/api/sync/${tipo}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productData: item, // Usamos productData como clave genérica por ahora
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setSuccess(`${item.title || item.id} sincronizado correctamente`)
        setSyncResult(data)
      } else {
        throw new Error(data.error || `Error al sincronizar ${item.title || item.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error desconocido al sincronizar`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="mb-4">
            <Progress value={70} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {selectedItem ? `Sincronizando ${selectedItem.title || selectedItem.id}...` : `Obteniendo ${tipo}...`}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Éxito</AlertTitle>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {items.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Elementos disponibles para sincronizar</h3>
            <div className="grid gap-2">
              {items.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{item.title || item.id}</p>
                    <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                  </div>
                  <Button size="sm" onClick={() => syncItem(item)} disabled={loading}>
                    <Database className="mr-2 h-4 w-4" />
                    Sincronizar
                  </Button>
                </div>
              ))}
              {items.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">Mostrando 5 de {items.length} elementos</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay {tipo} disponibles. Haz clic en "Obtener de Shopify" para comenzar.
            </p>
          </div>
        )}

        {syncResult && (
          <div className="mt-6 p-4 border rounded-md bg-slate-50">
            <h3 className="text-lg font-medium mb-2">Resultado de sincronización</h3>
            <pre className="text-xs overflow-auto p-2 bg-slate-100 rounded">{JSON.stringify(syncResult, null, 2)}</pre>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={fetchItems} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Obtener de Shopify
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
