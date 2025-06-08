"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { obtenerPromocionPorId, actualizarPromocion } from "@/lib/api/promociones"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditarPromocionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promocion, setPromocion] = useState<any>(null)

  // Actualizar el useEffect:
  useEffect(() => {
    async function loadPromotion() {
      try {
        setIsLoading(true)
        console.log(`Obteniendo promoción para editar: ${params.id}`)

        // Intentar obtener la promoción usando la función actualizada
        const data = await obtenerPromocionPorId(params.id)

        if (data) {
          console.log("Datos de promoción cargados:", data)
          setPromocion(data)
          setError(null)
        } else {
          throw new Error("No se pudo obtener la información de la promoción")
        }
      } catch (err) {
        console.error("Error obteniendo detalles del descuento:", err)
        setError(`No se pudo cargar la promoción: ${(err as Error).message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromotion()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      setError(null)

      // Validar que el valor sea un número positivo
      const valor = Number.parseFloat(promocion.valor)
      if (isNaN(valor) || valor <= 0) {
        setError("El valor de la promoción debe ser un número mayor que cero")
        setIsSaving(false)
        return
      }

      // Preparar los datos para la API
      const datosActualizados = {
        titulo: promocion.titulo,
        tipo: promocion.tipo,
        valor: promocion.valor,
        fechaInicio: promocion.fechaInicio,
        fechaFin: promocion.fechaFin,
        codigo: promocion.codigo,
        activa: promocion.activa,
      }

      await actualizarPromocion(params.id, datosActualizados)

      toast({
        title: "Promoción actualizada",
        description: "La promoción ha sido actualizada correctamente",
      })

      router.push(`/dashboard/promociones/${params.id}`)
    } catch (err) {
      console.error("Error al actualizar la promoción:", err)
      setError(`Error al actualizar la promoción: ${(err as Error).message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !promocion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar la promoción</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/dashboard/promociones")}>Volver a promociones</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar promoción</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la promoción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={promocion.titulo || ""}
                onChange={(e) => setPromocion({ ...promocion, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor del descuento</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="valor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={promocion.valor || ""}
                  onChange={(e) => setPromocion({ ...promocion, valor: e.target.value })}
                  required
                />
                <div className="w-24 flex-shrink-0">{promocion.tipo === "PORCENTAJE_DESCUENTO" ? "%" : "€"}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código promocional</Label>
              <Input
                id="codigo"
                value={promocion.codigo || ""}
                onChange={(e) => setPromocion({ ...promocion, codigo: e.target.value })}
                placeholder="Opcional"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha de inicio</Label>
                <div className="flex items-center gap-2 border rounded-md p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <DatePicker
                    date={promocion.fechaInicio}
                    setDate={(date) => setPromocion({ ...promocion, fechaInicio: date })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha de fin</Label>
                <div className="flex items-center gap-2 border rounded-md p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <DatePicker
                    date={promocion.fechaFin}
                    setDate={(date) => setPromocion({ ...promocion, fechaFin: date })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activa"
                checked={promocion.activa}
                onCheckedChange={(checked) => setPromocion({ ...promocion, activa: checked })}
              />
              <Label htmlFor="activa">Promoción activa</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
