"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Save, Percent, Tag, ShoppingBag, Truck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchPriceListById, updatePriceList } from "@/lib/api/promotions"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { Promotion, PromotionType, PromotionTarget } from "@/types/promotions"

export default function EditPromotionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promotion, setPromotion] = useState<Promotion | null>(null)

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
    active: true,
  })

  useEffect(() => {
    async function loadPromotion() {
      try {
        setIsLoading(true)
        const data = await fetchPriceListById(params.id)
        setPromotion(data)

        // Inicializar el formulario con los datos de la promoción
        setFormData({
          title: data.title || "",
          description: data.summary || "",
          type: (data.type as PromotionType) || "PERCENTAGE_DISCOUNT",
          target: (data.target as PromotionTarget) || "CART",
          targetId: data.targetId || "",
          value: data.value?.toString() || "",
          minimumPurchase:
            data.minimumRequirement?.type === "MINIMUM_AMOUNT" ? data.minimumRequirement.value?.toString() || "" : "",
          requiresCode: !!data.code,
          code: data.code || "",
          hasEndDate: !!data.endsAt,
          startDate: data.startsAt ? new Date(data.startsAt) : new Date(),
          endDate: data.endsAt ? new Date(data.endsAt) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
          limitUses: !!data.usageLimit,
          usageLimit: data.usageLimit?.toString() || "",
          active: data.status === "ACTIVE",
        })

        setError(null)
      } catch (err) {
        console.error("Error al cargar la promoción:", err)
        setError(`No se pudo cargar la promoción: ${(err as Error).message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromotion()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Validar datos
      if (!formData.title) {
        throw new Error("El nombre de la promoción es obligatorio")
      }

      if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }

      if (formData.requiresCode && !formData.code) {
        throw new Error("El código de la promoción es obligatorio si requiere código")
      }

      // Preparar datos para la API
      const updateData = {
        title: formData.title,
        summary: formData.description,
        endsAt: formData.hasEndDate ? formData.endDate.toISOString() : undefined,
        usageLimit: formData.limitUses ? Number(formData.usageLimit) : undefined,
      }

      await updatePriceList(params.id, updateData)

      toast({
        title: "¡Promoción actualizada!",
        description: "La promoción se ha actualizado correctamente",
      })

      router.push(`/dashboard/promotions/${params.id}`)
    } catch (error) {
      console.error("Error updating promotion:", error)
      setError(`No se pudo actualizar la promoción: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: `No se pudo actualizar la promoción: ${(error as Error).message}`,
        variant: "destructive",
      })
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
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error && !promotion) {
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

        <Button onClick={() => router.push("/dashboard/promotions")}>Volver a promociones</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar promoción</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
              />
              <p className="text-sm text-muted-foreground">Un nombre claro y atractivo para tu promoción</p>
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
            <CardDescription>El tipo de promoción no se puede cambiar después de la creación</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              disabled
            >
              <div
                className={`flex items-center space-x-2 border rounded-md p-4 ${formData.type === "PERCENTAGE_DISCOUNT" ? "border-primary" : "opacity-50"}`}
              >
                <RadioGroupItem value="PERCENTAGE_DISCOUNT" id="percentage" disabled />
                <Label htmlFor="percentage" className="flex items-center cursor-pointer">
                  <Percent className="h-5 w-5 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Descuento porcentual</p>
                    <p className="text-sm text-muted-foreground">Ej: 20% de descuento</p>
                  </div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-2 border rounded-md p-4 ${formData.type === "FIXED_AMOUNT_DISCOUNT" ? "border-primary" : "opacity-50"}`}
              >
                <RadioGroupItem value="FIXED_AMOUNT_DISCOUNT" id="fixed" disabled />
                <Label htmlFor="fixed" className="flex items-center cursor-pointer">
                  <Tag className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Descuento de cantidad fija</p>
                    <p className="text-sm text-muted-foreground">Ej: 10€ de descuento</p>
                  </div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-2 border rounded-md p-4 ${formData.type === "BUY_X_GET_Y" ? "border-primary" : "opacity-50"}`}
              >
                <RadioGroupItem value="BUY_X_GET_Y" id="buyxgety" disabled />
                <Label htmlFor="buyxgety" className="flex items-center cursor-pointer">
                  <ShoppingBag className="h-5 w-5 mr-2 text-purple-500" />
                  <div>
                    <p className="font-medium">Compra X y llévate Y</p>
                    <p className="text-sm text-muted-foreground">Ej: 2x1 en productos</p>
                  </div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-2 border rounded-md p-4 ${formData.type === "FREE_SHIPPING" ? "border-primary" : "opacity-50"}`}
              >
                <RadioGroupItem value="FREE_SHIPPING" id="shipping" disabled />
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
                    step={formData.type === "PERCENTAGE_DISCOUNT" ? "1" : "0.01"}
                    placeholder={formData.type === "PERCENTAGE_DISCOUNT" ? "20" : "10.00"}
                    value={formData.value}
                    onChange={handleInputChange}
                    disabled
                  />
                  <span className="ml-2 text-lg font-medium">
                    {formData.type === "PERCENTAGE_DISCOUNT" ? "%" : "€"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  El valor del descuento no se puede modificar después de la creación
                </p>
              </div>
            </div>
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
                      disabled
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
                      disabled
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  La fecha de inicio no se puede modificar después de la creación
                </p>
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
