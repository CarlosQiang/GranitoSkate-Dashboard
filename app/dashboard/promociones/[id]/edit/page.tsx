"use client"

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
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface EditPromocionPageProps {
  params: {
    id: string
  }
}

export default function EditPromocionPage({ params }: EditPromocionPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [promocion, setPromocion] = useState(null)

  const [formData, setFormData] = useState({
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
        console.log(`🔍 Cargando promoción para editar: ${params.id}`)
        const data = await fetchPromocionById(params.id)
        console.log(`📋 Datos de promoción cargados:`, data)

        setPromocion(data)

        // Convertir fechas para el input datetime-local
        const fechaInicio = data.fechaInicio || data.startsAt
        const fechaFin = data.fechaFin || data.endsAt

        setFormData({
          titulo: data.titulo || data.title || "",
          descripcion: data.descripcion || data.summary || "",
          tipo: data.tipo || data.valueType || "PERCENTAGE_DISCOUNT",
          objetivo: data.objetivo || "TODOS_LOS_PRODUCTOS",
          valor: String(data.valor || data.value || ""),
          codigo: data.codigo || data.code || "",
          usarCodigo: Boolean(data.codigo || data.code),
          fechaInicio: fechaInicio ? new Date(fechaInicio).toISOString().slice(0, 16) : "",
          fechaFin: fechaFin ? new Date(fechaFin).toISOString().slice(0, 16) : "",
          limitarUsos: Boolean(data.limitarUsos || data.usageLimit),
          limiteUsos: String(data.limiteUsos || data.usageLimit || "100"),
          compraMinima: String(data.compraMinima || ""),
          activa: data.activa !== undefined ? data.activa : data.status === "active",
        })
      } catch (error) {
        console.error("Error al cargar promoción:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la promoción",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (params.id) {
      cargarPromocion()
    }
  }, [params.id, toast])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const datosActualizados = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        objetivo: formData.objetivo,
        valor: formData.valor,
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString() : null,
        fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : null,
        codigo: formData.usarCodigo ? formData.codigo : null,
        limitarUsos: formData.limitarUsos,
        limiteUsos: formData.limitarUsos ? Number.parseInt(formData.limiteUsos) : null,
        compraMinima: formData.compraMinima ? Number.parseFloat(formData.compraMinima) : null,
        activa: formData.activa,
      }

      console.log(`📤 Enviando datos actualizados:`, datosActualizados)
      await actualizarPromocion(params.id, datosActualizados)

      toast({
        title: "¡Éxito!",
        description: "Promoción actualizada correctamente",
      })

      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("Error al actualizar promoción:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la promoción",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
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
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Descuento de verano 20%"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe tu promoción..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de descuento</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
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
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder={formData.tipo === "PERCENTAGE_DISCOUNT" ? "20" : "10"}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="usarCodigo">Usar código de descuento</Label>
                <Switch
                  id="usarCodigo"
                  checked={formData.usarCodigo}
                  onCheckedChange={(checked) => setFormData({ ...formData, usarCodigo: checked })}
                />
              </div>

              {formData.usarCodigo && (
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de descuento</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="VERANO2024"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Input
                  id="fechaInicio"
                  type="datetime-local"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin (opcional)</Label>
                <Input
                  id="fechaFin"
                  type="datetime-local"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="activa">Promoción activa</Label>
                <Switch
                  id="activa"
                  checked={formData.activa}
                  onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/promociones">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
