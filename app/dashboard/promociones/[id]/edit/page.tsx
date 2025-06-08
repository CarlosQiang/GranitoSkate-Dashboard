"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { fetchPromocionById, actualizarPromocion } from "@/lib/api/promociones"
import { ArrowLeft, Loader2, Save, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface EditPromocionPageProps {
  params: {
    id: string
  }
}

export default function EditPromocionPage({ params }: EditPromocionPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [promocion, setPromocion] = useState({
    titulo: "",
    descripcion: "",
    tipo: "PERCENTAGE_DISCOUNT",
    objetivo: "TODOS_LOS_PRODUCTOS",
    valor: "",
    codigo: "",
    usarCodigo: false,
    fechaInicio: "",
    fechaFin: "",
    limitarUsos: false,
    limiteUsos: "100",
    compraMinima: "",
    activa: true,
  })

  useEffect(() => {
    const cargarPromocion = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`🔍 Cargando promoción para editar: ${params.id}`)

        const data = await fetchPromocionById(params.id)
        console.log(`📋 Datos de promoción cargados:`, data)

        // Convertir fechas para el input date
        const fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString().split("T")[0] : ""
        const fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString().split("T")[0] : ""

        setPromocion({
          titulo: data.titulo || "",
          descripcion: data.descripcion || "",
          tipo: data.tipo || "PERCENTAGE_DISCOUNT",
          objetivo: data.objetivo || "TODOS_LOS_PRODUCTOS",
          valor: String(data.valor || ""),
          codigo: data.codigo || "",
          usarCodigo: Boolean(data.codigo),
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          limitarUsos: Boolean(data.limiteUsos),
          limiteUsos: String(data.limiteUsos || "100"),
          compraMinima: String(data.compraMinima || ""),
          activa: data.activa !== undefined ? data.activa : data.estado === "ACTIVE",
        })
      } catch (error) {
        console.error("Error al cargar promoción:", error)
        setError("No se pudo cargar la promoción. Por favor, inténtalo de nuevo.")
        toast({
          title: "Error",
          description: "No se pudo cargar la promoción",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      cargarPromocion()
    }
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!promocion.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const datosActualizados = {
        titulo: promocion.titulo,
        descripcion: promocion.descripcion,
        tipo: promocion.tipo,
        objetivo: promocion.objetivo,
        valor: promocion.valor,
        fechaInicio: promocion.fechaInicio ? new Date(promocion.fechaInicio).toISOString() : null,
        fechaFin: promocion.fechaFin ? new Date(promocion.fechaFin).toISOString() : null,
        codigo: promocion.usarCodigo ? promocion.codigo : null,
        limitarUsos: promocion.limitarUsos,
        limiteUsos: promocion.limitarUsos ? Number.parseInt(promocion.limiteUsos) : null,
        compraMinima: promocion.compraMinima ? Number.parseFloat(promocion.compraMinima) : null,
        activa: promocion.activa,
      }

      console.log(`📤 Enviando datos actualizados:`, datosActualizados)
      const resultado = await actualizarPromocion(params.id, datosActualizados)
      console.log(`✅ Promoción actualizada:`, resultado)

      if (resultado.shopify_updated) {
        setSuccess(true)
        toast({
          title: "¡Éxito!",
          description: "Promoción actualizada correctamente en Shopify",
        })

        // Esperar un poco antes de redirigir para mostrar el mensaje de éxito
        setTimeout(() => {
          router.push("/dashboard/promociones")
        }, 2000)
      } else {
        toast({
          title: "Actualización parcial",
          description: "La promoción se actualizó localmente, pero puede haber problemas con Shopify",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al actualizar promoción:", error)
      setError("No se pudo actualizar la promoción. Por favor, inténtalo de nuevo.")
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/promociones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Promoción</h1>
          <p className="text-muted-foreground">Modifica los datos de tu promoción</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            La promoción se ha actualizado correctamente en Shopify. Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información de la Promoción</CardTitle>
          <CardDescription>Actualiza los datos de tu promoción</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título de la promoción *</Label>
              <Input
                id="titulo"
                value={promocion.titulo}
                onChange={(e) => setPromocion({ ...promocion, titulo: e.target.value })}
                placeholder="Ej: Descuento de verano 20%"
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={promocion.descripcion}
                onChange={(e) => setPromocion({ ...promocion, descripcion: e.target.value })}
                placeholder="Describe tu promoción..."
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de descuento</Label>
                <Select
                  value={promocion.tipo}
                  onValueChange={(value) => setPromocion({ ...promocion, tipo: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE_DISCOUNT">Porcentaje</SelectItem>
                    <SelectItem value="FIXED_AMOUNT_DISCOUNT">Cantidad fija</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Envío gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor del descuento *</Label>
                <Input
                  id="valor"
                  type="number"
                  value={promocion.valor}
                  onChange={(e) => setPromocion({ ...promocion, valor: e.target.value })}
                  placeholder={promocion.tipo === "PERCENTAGE_DISCOUNT" ? "20" : "10"}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="usarCodigo">Usar código de descuento</Label>
                <Switch
                  id="usarCodigo"
                  checked={promocion.usarCodigo}
                  onCheckedChange={(checked) => setPromocion({ ...promocion, usarCodigo: checked })}
                  disabled={saving}
                />
              </div>

              {promocion.usarCodigo && (
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de descuento</Label>
                  <Input
                    id="codigo"
                    value={promocion.codigo}
                    onChange={(e) => setPromocion({ ...promocion, codigo: e.target.value })}
                    placeholder="VERANO2024"
                    disabled={saving}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={promocion.fechaInicio}
                  onChange={(e) => setPromocion({ ...promocion, fechaInicio: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin (opcional)</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={promocion.fechaFin}
                  onChange={(e) => setPromocion({ ...promocion, fechaFin: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="activa">Promoción activa</Label>
                <Switch
                  id="activa"
                  checked={promocion.activa}
                  onCheckedChange={(checked) => setPromocion({ ...promocion, activa: checked })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild disabled={saving}>
                <Link href="/dashboard/promociones">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando en Shopify...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
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
