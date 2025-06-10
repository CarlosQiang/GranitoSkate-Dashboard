"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save, Percent, Tag, Truck, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewPromotionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "PERCENTAGE_DISCOUNT",
    valor: "",
    codigo: "",
    compraMinima: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null) // Limpiar error al escribir
  }

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("🚀 Enviando promoción...")

      // Validaciones básicas del cliente
      if (!formData.titulo.trim()) {
        throw new Error("El título es obligatorio")
      }

      if (!formData.valor || Number(formData.valor) <= 0) {
        throw new Error("El valor debe ser mayor que 0")
      }

      // Preparar datos
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        valor: formData.valor,
        codigo: formData.codigo,
        compraMinima: formData.compraMinima,
        fechaInicio: new Date().toISOString(),
      }

      console.log("📤 Datos a enviar:", dataToSend)

      // Enviar petición
      const response = await fetch("/api/db/promociones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      console.log("📥 Respuesta:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Resultado:", result)

      if (!result.success) {
        throw new Error(result.error || "Error desconocido")
      }

      // Éxito
      toast({
        title: "¡Promoción creada!",
        description: "La promoción se ha creado correctamente",
      })

      router.push("/dashboard/promotions")
    } catch (error) {
      console.error("❌ Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nueva promoción</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar promoción"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Datos principales de la promoción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título de la promoción *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej: Descuento de verano"
                value={formData.titulo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Ej: 20% de descuento en todos los productos"
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de promoción</CardTitle>
            <CardDescription>Selecciona el tipo de descuento</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={formData.tipo} onValueChange={handleTipoChange} className="space-y-4">
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="PERCENTAGE_DISCOUNT" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center cursor-pointer">
                  <Percent className="h-5 w-5 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Descuento porcentual</p>
                    <p className="text-sm text-muted-foreground">Ej: 20% de descuento</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="FIXED_AMOUNT_DISCOUNT" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center cursor-pointer">
                  <Tag className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Descuento fijo</p>
                    <p className="text-sm text-muted-foreground">Ej: 10€ de descuento</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="FREE_SHIPPING" id="shipping" />
                <Label htmlFor="shipping" className="flex items-center cursor-pointer">
                  <Truck className="h-5 w-5 mr-2 text-orange-500" />
                  <div>
                    <p className="font-medium">Envío gratuito</p>
                    <p className="text-sm text-muted-foreground">Sin costes de envío</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor del descuento *</Label>
                <div className="flex items-center">
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    min="1"
                    step="1"
                    placeholder={formData.tipo === "PERCENTAGE_DISCOUNT" ? "20" : "10"}
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="ml-2 text-lg font-medium">
                    {formData.tipo === "PERCENTAGE_DISCOUNT" ? "%" : "€"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código promocional (opcional)</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  placeholder="Ej: VERANO2024"
                  value={formData.codigo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compraMinima">Compra mínima (opcional)</Label>
                <div className="flex items-center">
                  <Input
                    id="compraMinima"
                    name="compraMinima"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    value={formData.compraMinima}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-lg font-medium">€</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
