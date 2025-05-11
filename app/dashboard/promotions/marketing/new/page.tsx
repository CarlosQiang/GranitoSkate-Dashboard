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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Save, Facebook, Instagram, Mail, Globe, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createMarketingActivity } from "@/lib/api/promotions"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewMarketingCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "SOCIAL_MEDIA",
    channel: "FACEBOOK",
    targetAudience: "",
    budget: "",
    hasEndDate: false,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    utmCampaign: "",
    utmSource: "",
    utmMedium: "",
  })

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
    setIsLoading(true)
    setError(null)

    try {
      // Validar datos
      if (!formData.title) {
        throw new Error("El nombre de la campaña es obligatorio")
      }

      // Preparar datos para la API
      const campaignData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        channel: formData.channel,
        targetAudience: formData.targetAudience,
        budget: formData.budget ? Number(formData.budget) : undefined,
        startDate: formData.startDate.toISOString(),
        endDate: formData.hasEndDate ? formData.endDate.toISOString() : undefined,
        utmParameters: {
          campaign: formData.utmCampaign || undefined,
          source: formData.utmSource || undefined,
          medium: formData.utmMedium || undefined,
        },
      }

      console.log("Creando campaña de marketing:", campaignData)
      const result = await createMarketingActivity(campaignData)

      if (!result.success) {
        throw new Error(result.error || "Error al crear la campaña")
      }

      toast({
        title: "¡Campaña creada!",
        description: "La campaña de marketing se ha creado correctamente",
      })

      router.push("/dashboard/promotions?tab=marketing")
    } catch (error) {
      console.error("Error creating marketing campaign:", error)
      setError(`No se pudo crear la campaña: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: `No se pudo crear la campaña: ${(error as Error).message}`,
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
          <h1 className="text-3xl font-bold tracking-tight">Nueva campaña de marketing</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar campaña"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Consejos para campañas efectivas</AlertTitle>
        <AlertDescription className="text-blue-700">
          Las campañas de marketing bien segmentadas tienen mayor tasa de conversión. Define claramente tu público
          objetivo y personaliza el mensaje para obtener mejores resultados.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información básica</TabsTrigger>
          <TabsTrigger value="channel">Canal y audiencia</TabsTrigger>
          <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Configura los detalles principales de tu campaña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Nombre de la campaña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Campaña de verano 2023"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">Un nombre claro y descriptivo para tu campaña</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ej: Campaña para promocionar los nuevos productos de verano"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">Explica el objetivo y detalles de la campaña</p>
              </div>

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
                    <input
                      type="checkbox"
                      id="hasEndDate"
                      checked={formData.hasEndDate}
                      onChange={(e) => handleSwitchChange("hasEndDate", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("channel")}>Siguiente: Canal y audiencia</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Canal y audiencia</CardTitle>
              <CardDescription>Define dónde y a quién dirigirás tu campaña</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Canal de marketing</Label>
                  <RadioGroup
                    value={formData.channel}
                    onValueChange={(value) => handleSelectChange("channel", value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="FACEBOOK" id="facebook" />
                      <Label htmlFor="facebook" className="flex items-center cursor-pointer">
                        <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <p className="font-medium">Facebook</p>
                          <p className="text-sm text-muted-foreground">Anuncios en Facebook</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="INSTAGRAM" id="instagram" />
                      <Label htmlFor="instagram" className="flex items-center cursor-pointer">
                        <Instagram className="h-5 w-5 mr-2 text-pink-600" />
                        <div>
                          <p className="font-medium">Instagram</p>
                          <p className="text-sm text-muted-foreground">Anuncios en Instagram</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="EMAIL" id="email" />
                      <Label htmlFor="email" className="flex items-center cursor-pointer">
                        <Mail className="h-5 w-5 mr-2 text-yellow-600" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">Campaña de email marketing</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="OTHER" id="other" />
                      <Label htmlFor="other" className="flex items-center cursor-pointer">
                        <Globe className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <p className="font-medium">Otro</p>
                          <p className="text-sm text-muted-foreground">Otro canal de marketing</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Público objetivo</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    placeholder="Ej: Jóvenes entre 18-35 años interesados en deportes extremos"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground">Describe el público al que va dirigida esta campaña</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Presupuesto (€)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground">Presupuesto total asignado a esta campaña (opcional)</p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("basic")}>
                    Anterior
                  </Button>
                  <Button onClick={() => setActiveTab("tracking")}>Siguiente: Seguimiento</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de seguimiento</CardTitle>
              <CardDescription>Configura los parámetros UTM para hacer seguimiento de tu campaña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="utmCampaign">UTM Campaign</Label>
                <Input
                  id="utmCampaign"
                  name="utmCampaign"
                  placeholder="Ej: verano2023"
                  value={formData.utmCampaign}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  Nombre de la campaña para identificarla en Google Analytics
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmSource">UTM Source</Label>
                <Input
                  id="utmSource"
                  name="utmSource"
                  placeholder="Ej: facebook"
                  value={formData.utmSource}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  Origen del tráfico (Facebook, Instagram, Newsletter, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmMedium">UTM Medium</Label>
                <Input
                  id="utmMedium"
                  name="utmMedium"
                  placeholder="Ej: social"
                  value={formData.utmMedium}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">Medio de marketing (social, email, cpc, banner, etc.)</p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("channel")}>
                  Anterior
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Guardando..." : "Guardar campaña"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
