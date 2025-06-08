"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { fetchPromocionById, actualizarPromocion } from "@/lib/api/promociones"

interface PromocionData {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  valor: string | number
  fechaInicio: string
  fechaFin: string
  codigo?: string
  activa: boolean
}

export default function EditarPromocionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [promocion, setPromocion] = useState<PromocionData | null>(null)

  useEffect(() => {
    cargarPromocion()
  }, [params.id])

  const cargarPromocion = async () => {
    try {
      console.log(`🔍 Cargando promoción para editar: ${params.id}`)
      setLoading(true)

      const data = await fetchPromocionById(params.id)
      console.log(`📋 Datos de promoción cargados:`, data)

      setPromocion({
        id: data.id,
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        tipo: data.tipo || "PERCENTAGE_DISCOUNT",
        valor: data.valor || 0,
        fechaInicio: data.fechaInicio ? data.fechaInicio.split("T")[0] : "",
        fechaFin: data.fechaFin ? data.fechaFin.split("T")[0] : "",
        codigo: data.codigo || "",
        activa: data.activa || false,
      })
    } catch (error) {
      console.error("❌ Error cargando promoción:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la promoción",
        variant: "destructive",
      })
      router.push("/dashboard/promociones")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promocion) return

    try {
      setSaving(true)
      console.log(`📤 Enviando datos actualizados:`, promocion)

      const datosActualizados = {
        titulo: promocion.titulo,
        descripcion: promocion.descripcion,
        tipo: promocion.tipo,
        objetivo: "TODOS_LOS_PRODUCTOS",
        valor: promocion.valor.toString(),
        fechaInicio: new Date(promocion.fechaInicio).toISOString(),
        fechaFin: promocion.fechaFin ? new Date(promocion.fechaFin).toISOString() : null,
        codigo: promocion.codigo || null,
      }

      const resultado = await actualizarPromocion(params.id, datosActualizados)
      console.log(`✅ Promoción actualizada:`, resultado)

      toast({
        title: "Éxito",
        description: "Promoción actualizada correctamente",
      })

      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("❌ Error actualizando promoción:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la promoción",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando promoción...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!promocion) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Promoción no encontrada</h1>
          <Button onClick={() => router.push("/dashboard/promociones")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a promociones
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/promociones")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a promociones
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Promoción</h1>
        <p className="text-gray-600">Modifica los detalles de la promoción</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Promoción</CardTitle>
          <CardDescription>Actualiza la información de la promoción</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título de la promoción</Label>
                <Input
                  id="titulo"
                  value={promocion.titulo}
                  onChange={(e) => setPromocion({ ...promocion, titulo: e.target.value })}
                  placeholder="Ej: Descuento de verano"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de descuento</Label>
                <Select value={promocion.tipo} onValueChange={(value) => setPromocion({ ...promocion, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE_DISCOUNT">Porcentaje</SelectItem>
                    <SelectItem value="FIXED_AMOUNT_DISCOUNT">Cantidad fija</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">
                  Valor del descuento {promocion.tipo === "PERCENTAGE_DISCOUNT" ? "(%)" : "(€)"}
                </Label>
                <Input
                  id="valor"
                  type="number"
                  value={promocion.valor}
                  onChange={(e) => setPromocion({ ...promocion, valor: e.target.value })}
                  placeholder={promocion.tipo === "PERCENTAGE_DISCOUNT" ? "10" : "5.00"}
                  min="0"
                  max={promocion.tipo === "PERCENTAGE_DISCOUNT" ? "100" : undefined}
                  step={promocion.tipo === "PERCENTAGE_DISCOUNT" ? "1" : "0.01"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código promocional (opcional)</Label>
                <Input
                  id="codigo"
                  value={promocion.codigo}
                  onChange={(e) => setPromocion({ ...promocion, codigo: e.target.value })}
                  placeholder="Ej: VERANO2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={promocion.fechaInicio}
                  onChange={(e) => setPromocion({ ...promocion, fechaInicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin (opcional)</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={promocion.fechaFin}
                  onChange={(e) => setPromocion({ ...promocion, fechaFin: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={promocion.descripcion}
                onChange={(e) => setPromocion({ ...promocion, descripcion: e.target.value })}
                placeholder="Describe los detalles de la promoción..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/promociones")}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
