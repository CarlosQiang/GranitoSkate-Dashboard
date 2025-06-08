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
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PromocionData {
  id?: string
  titulo: string
  descripcion?: string
  tipo: string
  valor: string
  fechaInicio: Date | null
  fechaFin: Date | null
  codigo?: string
  activa: boolean
  limitarUsos?: boolean
  limiteUsos?: string
  compraMinima?: string
}

export default function EditarPromocionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promocion, setPromocion] = useState<PromocionData>({
    titulo: "",
    tipo: "PORCENTAJE_DESCUENTO",
    valor: "0",
    fechaInicio: new Date(),
    fechaFin: null,
    activa: true,
  })

  useEffect(() => {
    async function loadPromotion() {
      try {
        setIsLoading(true)
        console.log(`🔍 Cargando promoción para editar: ${params.id}`)

        const data = await obtenerPromocionPorId(params.id)

        if (data) {
          console.log("📋 Datos de promoción cargados:", data)

          setPromocion({
            id: data.id || params.id,
            titulo: data.titulo || "",
            descripcion: data.descripcion || "",
            tipo: data.tipo || "PORCENTAJE_DESCUENTO",
            valor: data.valor?.toString() || "0",
            fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
            fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
            codigo: data.codigo || "",
            activa: data.activa !== undefined ? data.activa : true,
            limitarUsos: data.limitarUsos || false,
            limiteUsos: data.limiteUsos?.toString() || "100",
            compraMinima: data.compraMinima?.toString() || "0",
          })
          setError(null)
        } else {
          throw new Error("No se pudo obtener la información de la promoción")
        }
      } catch (err) {
        console.error("❌ Error cargando promoción:", err)
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

      // Validaciones
      if (!promocion.titulo.trim()) {
        setError("El título es obligatorio")
        return
      }

      const valor = Number.parseFloat(promocion.valor)
      if (isNaN(valor) || valor < 0) {
        setError("El valor debe ser un número válido mayor o igual a 0")
        return
      }

      if (!promocion.fechaInicio) {
        setError("La fecha de inicio es obligatoria")
        return
      }

      // Preparar datos para envío
      const datosActualizados = {
        titulo: promocion.titulo.trim(),
        descripcion: promocion.descripcion?.trim() || promocion.titulo.trim(),
        tipo: promocion.tipo,
        valor: promocion.valor,
        fechaInicio: promocion.fechaInicio.toISOString(),
        fechaFin: promocion.fechaFin ? promocion.fechaFin.toISOString() : null,
        codigo: promocion.codigo?.trim() || null,
        activa: promocion.activa,
        limitarUsos: promocion.limitarUsos,
        limiteUsos: promocion.limitarUsos ? promocion.limiteUsos : null,
        compraMinima: promocion.compraMinima || null,
      }

      console.log("📤 Enviando datos actualizados:", datosActualizados)

      await actualizarPromocion(params.id, datosActualizados)

      toast({
        title: "✅ Promoción actualizada",
        description: "La promoción ha sido actualizada correctamente",
      })

      router.push(`/dashboard/promociones/${params.id}`)
    } catch (err) {
      console.error("❌ Error al actualizar promoción:", err)
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

  if (error && !promocion.titulo) {
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
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={promocion.titulo}
                onChange={(e) => setPromocion({ ...promocion, titulo: e.target.value })}
                required
                placeholder="Nombre de la promoción"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={promocion.descripcion || ""}
                onChange={(e) => setPromocion({ ...promocion, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor del descuento *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={promocion.valor}
                  onChange={(e) => setPromocion({ ...promocion, valor: e.target.value })}
                  required
                />
                <div className="w-24 flex-shrink-0 text-sm text-muted-foreground">
                  {promocion.tipo === "PORCENTAJE_DESCUENTO" ? "%" : "€"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código promocional</Label>
              <Input
                id="codigo"
                value={promocion.codigo || ""}
                onChange={(e) => setPromocion({ ...promocion, codigo: e.target.value })}
                placeholder="Código opcional (ej: DESCUENTO10)"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha de inicio *</Label>
                <DatePicker
                  date={promocion.fechaInicio}
                  setDate={(date) => setPromocion({ ...promocion, fechaInicio: date })}
                  placeholder="Seleccionar fecha de inicio"
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de fin</Label>
                <DatePicker
                  date={promocion.fechaFin}
                  setDate={(date) => setPromocion({ ...promocion, fechaFin: date })}
                  placeholder="Sin fecha de fin"
                />
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
