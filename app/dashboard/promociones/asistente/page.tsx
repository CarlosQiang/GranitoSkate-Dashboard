"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { crearPromocion } from "@/lib/api/promociones"
import { ArrowLeft, Loader2, Calendar, Tag, Percent, DollarSign, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AsistentePromocionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("informacion")

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "PORCENTAJE_DESCUENTO",
    objetivo: "TODOS_LOS_PRODUCTOS",
    valor: "",
    codigo: "",
    usarCodigo: true,
    fechaInicio: "",
    fechaFin: "",
    limitarUsos: false,
    limiteUsos: "100",
    compraMinima: "",
  })

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

    if (!formData.valor && formData.tipo !== "ENVIO_GRATIS") {
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
        descripcion: formData.descripcion || formData.titulo,
        tipo: formData.tipo,
        objetivo: formData.objetivo,
        valor: formData.tipo === "ENVIO_GRATIS" ? 0 : formData.valor,
        fechaInicio: formData.fechaInicio || new Date().toISOString(),
        fechaFin: formData.fechaFin || null,
        codigo: formData.usarCodigo ? formData.codigo : null,
        limitarUsos: formData.limitarUsos,
        limiteUsos: formData.limitarUsos ? Number.parseInt(formData.limiteUsos) : null,
        compraMinima: formData.compraMinima ? Number.parseFloat(formData.compraMinima) : null,
      }

      const resultado = await crearPromocion(promocionData)
      console.log("Promoción creada:", resultado)

      toast({
        title: "¡Éxito!",
        description: "Promoción creada correctamente",
      })

      // Redirigir a la página de promociones después de un breve retraso
      setTimeout(() => {
        router.push("/dashboard/promociones")
      }, 1000)
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

  const nextTab = () => {
    if (activeTab === "informacion") setActiveTab("configuracion")
    else if (activeTab === "configuracion") setActiveTab("condiciones")
    else if (activeTab === "condiciones") setActiveTab("resumen")
  }

  const prevTab = () => {
    if (activeTab === "resumen") setActiveTab("condiciones")
    else if (activeTab === "condiciones") setActiveTab("configuracion")
    else if (activeTab === "configuracion") setActiveTab("informacion")
  }

  const getTabIcon = (tab) => {
    switch (tab) {
      case "informacion":
        return <Tag className="h-4 w-4" />
      case "configuracion":
        return <Percent className="h-4 w-4" />
      case "condiciones":
        return <Calendar className="h-4 w-4" />
      case "resumen":
        return <ShoppingBag className="h-4 w-4" />
      default:
        return null
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

      <Card>
        <CardHeader>
          <CardTitle>Asistente de Promociones</CardTitle>
          <CardDescription>Completa los pasos para crear una nueva promoción</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="informacion">
                {getTabIcon("informacion")}
                <span className="ml-2">Información</span>
              </TabsTrigger>
              <TabsTrigger value="configuracion">
                {getTabIcon("configuracion")}
                <span className="ml-2">Configuración</span>
              </TabsTrigger>
              <TabsTrigger value="condiciones">
                {getTabIcon("condiciones")}
                <span className="ml-2">Condiciones</span>
              </TabsTrigger>
              <TabsTrigger value="resumen">
                {getTabIcon("resumen")}
                <span className="ml-2">Resumen</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="space-y-6">
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="objetivo">Aplicar a</Label>
                  <Select
                    value={formData.objetivo}
                    onValueChange={(value) => setFormData({ ...formData, objetivo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS_LOS_PRODUCTOS">Todos los productos</SelectItem>
                      <SelectItem value="PRODUCTOS_ESPECIFICOS">Productos específicos</SelectItem>
                      <SelectItem value="COLECCIONES">Colecciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={nextTab}>Siguiente</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuracion" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de descuento</Label>
                  <RadioGroup
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                  >
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <RadioGroupItem value="PORCENTAJE_DESCUENTO" id="porcentaje" />
                      <Label htmlFor="porcentaje" className="flex items-center">
                        <Percent className="mr-2 h-4 w-4" />
                        Porcentaje
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <RadioGroupItem value="CANTIDAD_FIJA" id="cantidad" />
                      <Label htmlFor="cantidad" className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Cantidad fija
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <RadioGroupItem value="ENVIO_GRATIS" id="envio" />
                      <Label htmlFor="envio" className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Envío gratis
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.tipo !== "ENVIO_GRATIS" && (
                  <div className="space-y-2">
                    <Label htmlFor="valor">
                      {formData.tipo === "PORCENTAJE_DESCUENTO"
                        ? "Porcentaje de descuento *"
                        : "Cantidad a descontar *"}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="valor"
                        type="number"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        placeholder={formData.tipo === "PORCENTAJE_DESCUENTO" ? "20" : "10"}
                        required
                        className="flex-1"
                      />
                      <span className="ml-2 text-lg font-medium">
                        {formData.tipo === "PORCENTAJE_DESCUENTO" ? "%" : "€"}
                      </span>
                    </div>
                  </div>
                )}

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

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevTab}>
                    Anterior
                  </Button>
                  <Button onClick={nextTab}>Siguiente</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="condiciones" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="limitarUsos">Limitar número de usos</Label>
                    <Switch
                      id="limitarUsos"
                      checked={formData.limitarUsos}
                      onCheckedChange={(checked) => setFormData({ ...formData, limitarUsos: checked })}
                    />
                  </div>

                  {formData.limitarUsos && (
                    <div className="space-y-2">
                      <Label htmlFor="limiteUsos">Número máximo de usos</Label>
                      <Input
                        id="limiteUsos"
                        type="number"
                        value={formData.limiteUsos}
                        onChange={(e) => setFormData({ ...formData, limiteUsos: e.target.value })}
                        min="1"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compraMinima">Compra mínima (opcional)</Label>
                  <div className="flex items-center">
                    <Input
                      id="compraMinima"
                      type="number"
                      value={formData.compraMinima}
                      onChange={(e) => setFormData({ ...formData, compraMinima: e.target.value })}
                      placeholder="50"
                      className="flex-1"
                    />
                    <span className="ml-2 text-lg font-medium">€</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevTab}>
                    Anterior
                  </Button>
                  <Button onClick={nextTab}>Siguiente</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resumen" className="space-y-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de la promoción</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Título</h3>
                        <p>{formData.titulo || "Sin título"}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Tipo</h3>
                        <p>
                          {formData.tipo === "PORCENTAJE_DESCUENTO" && "Porcentaje de descuento"}
                          {formData.tipo === "CANTIDAD_FIJA" && "Cantidad fija"}
                          {formData.tipo === "ENVIO_GRATIS" && "Envío gratis"}
                        </p>
                      </div>
                      {formData.tipo !== "ENVIO_GRATIS" && (
                        <div>
                          <h3 className="font-medium">Valor</h3>
                          <p>
                            {formData.valor} {formData.tipo === "PORCENTAJE_DESCUENTO" ? "%" : "€"}
                          </p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">Aplicado a</h3>
                        <p>
                          {formData.objetivo === "TODOS_LOS_PRODUCTOS" && "Todos los productos"}
                          {formData.objetivo === "PRODUCTOS_ESPECIFICOS" && "Productos específicos"}
                          {formData.objetivo === "COLECCIONES" && "Colecciones"}
                        </p>
                      </div>
                      {formData.usarCodigo && (
                        <div>
                          <h3 className="font-medium">Código</h3>
                          <p>{formData.codigo || "Sin código"}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">Período</h3>
                        <p>
                          {formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString() : "Desde hoy"}
                          {formData.fechaFin
                            ? ` hasta ${new Date(formData.fechaFin).toLocaleDateString()}`
                            : " sin fecha de fin"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevTab}>
                    Anterior
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bg-granito hover:bg-granito/90">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear promoción
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
