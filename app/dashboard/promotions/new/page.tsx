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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Save, Percent, Tag, ShoppingBag, Truck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { PromotionType, PromotionTarget } from "@/types/promotions"

export default function NewPromotionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PERCENTAGE_DISCOUNT" as PromotionType,
    target: "CART" as PromotionTarget,
    targetId: "",
    value: "",
    minimumPurchase: "",
    requiresCode: false,
    code: "",
    hasEndDate: false,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    limitUses: false,
    usageLimit: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors.length > 0) {
      setValidationErrors([])
      setError(null)
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        [name]: date,
      })
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    // Validar título
    if (!formData.title.trim()) {
      errors.push("El título es obligatorio")
    } else if (formData.title.trim().length < 3) {
      errors.push("El título debe tener al menos 3 caracteres")
    }

    // Validar valor
    if (!formData.value) {
      errors.push("El valor del descuento es obligatorio")
    } else if (isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      errors.push("El valor debe ser un número mayor que cero")
    } else if (formData.type === "PERCENTAGE_DISCOUNT" && Number(formData.value) > 100) {
      errors.push("El porcentaje no puede ser mayor que 100%")
    }

    // Validar código si se requiere
    if (formData.requiresCode) {
      if (!formData.code.trim()) {
        errors.push("El código promocional es obligatorio si se requiere código")
      } else if (formData.code.trim().length < 3) {
        errors.push("El código promocional debe tener al menos 3 caracteres")
      }
    }

    // Validar límite de usos
    if (formData.limitUses) {
      if (!formData.usageLimit || isNaN(Number(formData.usageLimit)) || Number(formData.usageLimit) <= 0) {
        errors.push("El límite de usos debe ser un número mayor que cero")
      }
    }

    // Validar target específico
    if (formData.target !== "CART" && !formData.targetId.trim()) {
      errors.push(`El ID de ${formData.target === "COLLECTION" ? "colección" : "producto"} es obligatorio`)
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setValidationErrors([])

    try {
      console.log("🚀 Iniciando creación de promoción...")

      // Validaciones del lado del cliente
      const clientErrors = validateForm()
      if (clientErrors.length > 0) {
        setValidationErrors(clientErrors)
        setError("Por favor, corrige los errores antes de continuar")
        return
      }

      // Preparar datos para envío
      const promotionData = {
        titulo: formData.title.trim(),
        descripcion: formData.description.trim() || formData.title.trim(),
        tipo: formData.type,
        valor: Number(formData.value),
        target: formData.target,
        targetId: formData.targetId || null,
        fechaInicio: formData.startDate.toISOString(),
        fechaFin: formData.hasEndDate ? formData.endDate.toISOString() : null,
        codigo: formData.requiresCode ? formData.code.trim() : null,
        activa: true,
        limitarUsos: formData.limitUses,
        limiteUsos: formData.limitUses ? Number(formData.usageLimit) : null,
        compraMinima: formData.minimumPurchase ? Number(formData.minimumPurchase) : null,
      }

      console.log("📤 Enviando datos:", promotionData)

      // Realizar petición
      const response = await fetch("/api/db/promociones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promotionData),
      })

      console.log("📥 Respuesta recibida:", response.status, response.statusText)

      // Verificar respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))

        if (errorData.details && Array.isArray(errorData.details)) {
          setValidationErrors(errorData.details)
          setError("Errores de validación del servidor:")
        } else {
          setError(errorData.error || `Error HTTP: ${response.status}`)
        }

        console.error("❌ Error del servidor:", errorData)
        return
      }

      const result = await response.json()
      console.log("✅ Resultado:", result)

      if (!result.success) {
        throw new Error(result.error || "Error al crear promoción")
      }

      // Éxito
      toast({
        title: "¡Promoción creada!",
        description: "La promoción se ha creado correctamente",
      })

      // Redirigir
      router.push("/dashboard/promotions")
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error)
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
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nueva promoción</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar promoción"}
        </Button>
      </div>

      {(error || validationErrors.length > 0) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error && <div className="mb-2">{error}</div>}
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Consejos para promociones efectivas</AlertTitle>
        <AlertDescription className="text-blue-700">
          Las promociones temporales generan sensación de urgencia. Considera usar descuentos por tiempo limitado para
          productos de skate o graffiti para aumentar las ventas.
        </AlertDescription>
      </Alert>

      <form className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Configura los detalles principales de tu promoción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Nombre de la promoción <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Descuento en tablas de skate"
                value={formData.title}
                onChange={handleInputChange}
                className={validationErrors.some((err) => err.includes("título")) ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">
                Un nombre claro y atractivo para tu promoción (mínimo 3 caracteres)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Ej: Aprovecha este descuento especial en todas nuestras tablas de skate"
                value={formData.description}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">Explica los detalles de la promoción para tus clientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de promoción</CardTitle>
            <CardDescription>Selecciona qué tipo de descuento quieres ofrecer</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="PERCENTAGE_DISCOUNT" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center cursor-pointer">
                  <Percent className="h-5 w-5 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Descuento porcentual</p>
                    <p className="text-sm text-muted-foreground">Ej: 20% de descuento</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="FIXED_AMOUNT_DISCOUNT" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center cursor-pointer">
                  <Tag className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Descuento de cantidad fija</p>
                    <p className="text-sm text-muted-foreground">Ej: 10€ de descuento</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="BUY_X_GET_Y" id="buyxgety" />
                <Label htmlFor="buyxgety" className="flex items-center cursor-pointer">
                  <ShoppingBag className="h-5 w-5 mr-2 text-purple-500" />
                  <div>
                    <p className="font-medium">Compra X y llévate Y</p>
                    <p className="text-sm text-muted-foreground">Ej: 2x1 en productos</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
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
                <Label htmlFor="value">
                  Valor del descuento <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    min="0"
                    max={formData.type === "PERCENTAGE_DISCOUNT" ? "100" : undefined}
                    step={formData.type === "PERCENTAGE_DISCOUNT" ? "1" : "0.01"}
                    placeholder={formData.type === "PERCENTAGE_DISCOUNT" ? "20" : "10.00"}
                    value={formData.value}
                    onChange={handleInputChange}
                    className={validationErrors.some((err) => err.includes("valor")) ? "border-red-500" : ""}
                  />
                  <span className="ml-2 text-lg font-medium">
                    {formData.type === "PERCENTAGE_DISCOUNT" ? "%" : "€"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.type === "PERCENTAGE_DISCOUNT"
                    ? "Porcentaje de descuento a aplicar (máximo 100%)"
                    : formData.type === "FIXED_AMOUNT_DISCOUNT"
                      ? "Cantidad fija a descontar del precio"
                      : formData.type === "BUY_X_GET_Y"
                        ? "Número de productos gratis"
                        : "Valor mínimo de compra para envío gratuito"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumPurchase">Compra mínima</Label>
                <div className="flex items-center">
                  <Input
                    id="minimumPurchase"
                    name="minimumPurchase"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="30.00"
                    value={formData.minimumPurchase}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-lg font-medium">€</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Valor mínimo de compra para aplicar la promoción (opcional)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aplicación de la promoción</CardTitle>
            <CardDescription>Define dónde se aplicará esta promoción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Aplicar a</Label>
              <Select value={formData.target} onValueChange={(value) => handleSelectChange("target", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona dónde aplicar la promoción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CART">Toda la tienda</SelectItem>
                  <SelectItem value="COLLECTION">Una colección específica</SelectItem>
                  <SelectItem value="PRODUCT">Un producto específico</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Elige si la promoción se aplica a toda la tienda o a productos específicos
              </p>
            </div>

            {formData.target !== "CART" && (
              <div className="space-y-2">
                <Label htmlFor="targetId">
                  {formData.target === "COLLECTION" ? "Colección" : "Producto"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="targetId"
                  name="targetId"
                  placeholder={
                    formData.target === "COLLECTION"
                      ? "ID de la colección (ej: gid://shopify/Collection/123456789)"
                      : "ID del producto (ej: gid://shopify/Product/123456789)"
                  }
                  value={formData.targetId}
                  onChange={handleInputChange}
                  className={validationErrors.some((err) => err.includes("ID")) ? "border-red-500" : ""}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.target === "COLLECTION"
                    ? "ID de la colección a la que se aplicará la promoción"
                    : "ID del producto al que se aplicará la promoción"}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="requiresCode"
                checked={formData.requiresCode}
                onCheckedChange={(checked) => handleSwitchChange("requiresCode", checked)}
              />
              <Label htmlFor="requiresCode">Requiere código promocional</Label>
            </div>

            {formData.requiresCode && (
              <div className="space-y-2">
                <Label htmlFor="code">
                  Código promocional <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Ej: VERANO2023"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={validationErrors.some((err) => err.includes("código")) ? "border-red-500" : ""}
                />
                <p className="text-sm text-muted-foreground">
                  Código que los clientes deberán introducir para aplicar la promoción (mínimo 3 caracteres)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duración y límites</CardTitle>
            <CardDescription>Establece cuándo y cómo se puede usar la promoción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasEndDate"
                    checked={formData.hasEndDate}
                    onCheckedChange={(checked) => handleSwitchChange("hasEndDate", checked)}
                  />
                  <Label htmlFor="hasEndDate">Tiene fecha de finalización</Label>
                </div>

                {formData.hasEndDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleDateChange("endDate", date)}
                        initialFocus
                        disabled={(date) => date < formData.startDate}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="limitUses"
                  checked={formData.limitUses}
                  onCheckedChange={(checked) => handleSwitchChange("limitUses", checked)}
                />
                <Label htmlFor="limitUses">Limitar número de usos</Label>
              </div>

              {formData.limitUses && (
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">
                    Número máximo de usos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="100"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className={validationErrors.some((err) => err.includes("límite")) ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-muted-foreground">Cuántas veces se puede usar esta promoción en total</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
