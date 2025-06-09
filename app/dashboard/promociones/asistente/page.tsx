"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { crearPromocion } from "@/lib/api/promociones"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"

export default function AsistentePromocionesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "PORCENTAJE_DESCUENTO",
    objetivo: "TODOS_LOS_PRODUCTOS",
    valor: "",
    codigo: "",
    fechaInicio: new Date(),
    fechaFin: null as Date | null,
    limitarUsos: false,
    limiteUsos: "",
    compraMinima: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo || !formData.valor) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      console.log("📝 Creando promoción:", formData)

      const promocionData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        objetivo: formData.objetivo,
        valor: formData.valor,
        codigo: formData.codigo || null,
        fechaInicio: formData.fechaInicio.toISOString(),
        fechaFin: formData.fechaFin ? formData.fechaFin.toISOString() : null,
        limitarUsos: formData.limitarUsos,
        limiteUsos: formData.limitarUsos ? Number.parseInt(formData.limiteUsos) : null,
        compraMinima: formData.compraMinima ? Number.parseFloat(formData.compraMinima) : null,
      }

      const result = await crearPromocion(promocionData)
      console.log("Promoción creada:", result)

      toast.success("Promoción creada exitosamente")
      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("Error creando promoción:", error)
      toast.error("Error al crear la promoción")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Promoción</h1>
          <p className="text-muted-foreground">Crea una nueva promoción para tu tienda</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Promoción</CardTitle>
          <CardDescription>Completa los datos para crear tu promoción</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
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

            {/* Descripción */}
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

            {/* Tipo de descuento */}
            <div className="space-y-2">
              <Label>Tipo de descuento</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PORCENTAJE_DESCUENTO">Porcentaje de descuento</SelectItem>
                  <SelectItem value="CANTIDAD_FIJA_DESCUENTO">Cantidad fija de descuento</SelectItem>
                  <SelectItem value="ENVIO_GRATIS">Envío gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor del descuento */}
            {formData.tipo !== "ENVIO_GRATIS" && (
              <div className="space-y-2">
                <Label htmlFor="valor">
                  Valor del descuento * {formData.tipo === "PORCENTAJE_DESCUENTO" ? "(%)" : "(€)"}
                </Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder={formData.tipo === "PORCENTAJE_DESCUENTO" ? "20" : "10.00"}
                  min="0"
                  step={formData.tipo === "PORCENTAJE_DESCUENTO" ? "1" : "0.01"}
                  required
                />
              </div>
            )}

            {/* Código de descuento */}
            <div className="space-y-2">
              <Label htmlFor="codigo">Código de descuento (opcional)</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="VERANO2024"
              />
              <p className="text-sm text-muted-foreground">Si no especificas un código, será un descuento automático</p>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de inicio *</Label>
                <DatePicker
                  date={formData.fechaInicio}
                  onSelect={(date) => date && setFormData({ ...formData, fechaInicio: date })}
                  placeholder="Seleccionar fecha"
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de fin (opcional)</Label>
                <DatePicker
                  date={formData.fechaFin}
                  onSelect={(date) => setFormData({ ...formData, fechaFin: date })}
                  placeholder="Sin fecha límite"
                />
              </div>
            </div>

            {/* Límite de usos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="limitarUsos"
                  checked={formData.limitarUsos}
                  onCheckedChange={(checked) => setFormData({ ...formData, limitarUsos: checked })}
                />
                <Label htmlFor="limitarUsos">Limitar número de usos</Label>
              </div>

              {formData.limitarUsos && (
                <div className="space-y-2">
                  <Label htmlFor="limiteUsos">Número máximo de usos</Label>
                  <Input
                    id="limiteUsos"
                    type="number"
                    value={formData.limiteUsos}
                    onChange={(e) => setFormData({ ...formData, limiteUsos: e.target.value })}
                    placeholder="100"
                    min="1"
                  />
                </div>
              )}
            </div>

            {/* Compra mínima */}
            <div className="space-y-2">
              <Label htmlFor="compraMinima">Compra mínima (€) (opcional)</Label>
              <Input
                id="compraMinima"
                type="number"
                value={formData.compraMinima}
                onChange={(e) => setFormData({ ...formData, compraMinima: e.target.value })}
                placeholder="50.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Promoción
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
