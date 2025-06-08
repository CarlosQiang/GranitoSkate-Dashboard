"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { crearPromocion } from "@/lib/api/promociones"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AsistentePromocionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "PORCENTAJE_DESCUENTO",
    valor: "",
    codigo: "",
    fechaInicio: "",
    fechaFin: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.valor) {
      toast({
        title: "Error",
        description: "El valor del descuento es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const promocionData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        objetivo: "TODOS_LOS_PRODUCTOS",
        valor: formData.valor,
        fechaInicio: formData.fechaInicio || new Date().toISOString(),
        fechaFin: formData.fechaFin || null,
        codigo: formData.codigo || null,
      }

      await crearPromocion(promocionData)

      toast({
        title: "¡Éxito!",
        description: "Promoción creada correctamente",
      })

      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("Error al crear promoción:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la promoción. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Crear Promoción</h1>
          <p className="text-muted-foreground">Crea una nueva promoción para tu tienda</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información de la Promoción</CardTitle>
          <CardDescription>Completa los datos básicos de tu promoción</CardDescription>
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
                    <SelectItem value="PORCENTAJE_DESCUENTO">Porcentaje</SelectItem>
                    <SelectItem value="CANTIDAD_FIJA">Cantidad fija</SelectItem>
                    <SelectItem value="ENVIO_GRATIS">Envío gratis</SelectItem>
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
                  placeholder={formData.tipo === "PORCENTAJE_DESCUENTO" ? "20" : "10"}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código de descuento (opcional)</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="VERANO2024"
              />
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

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/promociones">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear promoción
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
