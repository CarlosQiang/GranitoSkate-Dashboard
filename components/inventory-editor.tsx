"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Save, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getInventoryLevel, updateInventoryLevel } from "@/lib/api/products"

export function InventoryEditor({ productId, variantId, initialQuantity = 0, onUpdate }) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(initialQuantity.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setQuantity(initialQuantity.toString())
  }, [initialQuantity])

  const handleRefresh = async () => {
    if (!variantId) return

    try {
      setIsRefreshing(true)
      setError(null)
      const currentQuantity = await getInventoryLevel(variantId)
      setQuantity(currentQuantity.toString())
      toast({
        title: "Inventario actualizado",
        description: "Se ha obtenido la cantidad actual del inventario",
      })
    } catch (err) {
      setError("No se pudo obtener el inventario actual: " + err.message)
      toast({
        title: "Error",
        description: "No se pudo obtener el inventario actual",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!variantId) {
      setError("No se encontró la variante del producto")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await updateInventoryLevel(variantId, Number.parseInt(quantity, 10))
      toast({
        title: "Inventario actualizado",
        description: "La cantidad de inventario se ha actualizado correctamente",
      })
      if (onUpdate) {
        onUpdate(Number.parseInt(quantity, 10))
      }
    } catch (err) {
      setError("Error al actualizar el inventario: " + err.message)
      toast({
        title: "Error",
        description: "No se pudo actualizar el inventario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de inventario</CardTitle>
        <CardDescription>Actualiza la cantidad disponible en stock</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad en stock</Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing || !variantId}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !variantId}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
