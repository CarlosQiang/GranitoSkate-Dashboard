"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Check } from "lucide-react"
import { crearPromocion } from "@/lib/api/promociones"

// Definición de plantillas predefinidas
const plantillas = {
  bienvenida: {
    titulo: "Descuento de bienvenida",
    descripcion: "10% de descuento en el primer pedido para nuevos clientes",
    tipo: "PORCENTAJE_DESCUENTO",
    valor: "10",
    requiereCodigo: true,
    codigo: "BIENVENIDA",
    tieneFechaFin: false,
    limitarUsos: true,
    limiteUsos: "1",
  },
  flash: {
    titulo: "Venta flash 24h",
    descripcion: "25% de descuento durante 24 horas",
    tipo: "PORCENTAJE_DESCUENTO",
    valor: "25",
    requiereCodigo: false,
    tieneFechaFin: true,
    fechaFin: new Date(new Date().setDate(new Date().getDate() + 1)), // 24 horas
    limitarUsos: false,
  },
  "2x3": {
    titulo: "Compra 2 y lleva 3",
    descripcion: "Llévate 3 productos pagando solo 2",
    tipo: "COMPRA_X_LLEVA_Y",
    valor: "1", // 1 producto gratis
    requiereCodigo: false,
    tieneFechaFin: false,
    limitarUsos: false,
  },
  "envio-gratis": {
    titulo: "Envío gratis",
    descripcion: "Envío gratis en pedidos superiores a 50€",
    tipo: "ENVIO_GRATIS",
    valor: "50",
    requiereCodigo: false,
    tieneFechaFin: false,
    limitarUsos: false,
  },
  regalo: {
    titulo: "Regalo sorpresa",
    descripcion: "Regalo sorpresa en pedidos superiores a 100€",
    tipo: "CANTIDAD_FIJA",
    valor: "0", // No hay descuento, solo regalo
    compraMinima: "100",
    requiereCodigo: false,
    tieneFechaFin: false,
    limitarUsos: false,
  },
  temporada: {
    titulo: "Descuento por temporada",
    descripcion: "20% de descuento en productos de temporada",
    tipo: "PORCENTAJE_DESCUENTO",
    valor: "20",
    requiereCodigo: true,
    codigo: "TEMPORADA",
    tieneFechaFin: true,
    fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 meses
    limitarUsos: false,
  },
}

export default function PlantillaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [enviando, setEnviando] = useState(false)
  const [plantilla, setPlantilla] = useState<any>(null)

  // Cargar la plantilla según el ID
  useEffect(() => {
    const id = params.id
    if (id && plantillas[id as keyof typeof plantillas]) {
      setPlantilla({
        ...plantillas[id as keyof typeof plantillas],
        fechaInicio: new Date(),
        objetivo: "CARRITO",
        objetivoId: "",
      })
    } else {
      // Si no existe la plantilla, redirigir a la página de marketing
      router.push("/dashboard/marketing")
    }
  }, [params.id, router])

  // Si no hay plantilla, mostrar cargando
  if (!plantilla) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando plantilla...</p>
      </div>
    )
  }

  const handleChange = (field: string, value: any) => {
    setPlantilla((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      setEnviando(true)

      // Preparar datos para la API
      const datosAPI = {
        titulo: plantilla.titulo,
        descripcion: plantilla.descripcion,
        tipo: plantilla.tipo,
        objetivo: plantilla.objetivo,
        objetivoId: plantilla.objetivoId || undefined,
        valor: Number(plantilla.valor),
        condiciones: [],
        activa: true,
        fechaInicio: plantilla.fechaInicio.toISOString(),
        fechaFin: plantilla.tieneFechaFin ? plantilla.fechaFin.toISOString() : undefined,
        codigo: plantilla.requiereCodigo ? plantilla.codigo : undefined,
        limiteUsos: plantilla.limitarUsos ? Number(plantilla.limiteUsos) : undefined,
        contadorUsos: 0,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      }

      // Añadir condición de compra mínima si se especifica
      if (plantilla.compraMinima && !isNaN(Number(plantilla.compraMinima)) && Number(plantilla.compraMinima) > 0) {
        datosAPI.condiciones.push({
          tipo: "CANTIDAD_MINIMA",
          valor: Number(plantilla.compraMinima),
        })
      }

      // Llamada a la API
      await crearPromocion(datosAPI)

      // Notificar éxito
      toast({
        title: "¡Promoción creada!",
        description: "La promoción se ha creado correctamente a partir de la plantilla",
      })

      // Redireccionar a la lista de promociones
      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("Error al crear promoción:", error)
      toast({
        title: "Error",
        description: `No se pudo crear la promoción: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera con botón de volver */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/marketing")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Plantilla: {plantilla.titulo}</h1>
        </div>
      </div>

      {/* Tarjeta principal */}
      <Card>
        <CardHeader>
          <CardTitle>Personaliza la plantilla</CardTitle>
          <CardDescription>Personaliza los detalles de la promoción antes de crearla</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título y descripción */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título de la promoción</Label>
              <Input id="titulo" value={plantilla.titulo} onChange={(e) => handleChange("titulo", e.target.value)} />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={plantilla.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
            </div>
          </div>

          {/* Valor */}
          <div>
            <Label htmlFor="valor">
              {plantilla.tipo === "PORCENTAJE_DESCUENTO"
                ? "Porcentaje de descuento"
                : plantilla.tipo === "CANTIDAD_FIJA"
                  ? "Cantidad a descontar (€)"
                  : plantilla.tipo === "COMPRA_X_LLEVA_Y"
                    ? "Cantidad de productos gratis"
                    : "Valor mínimo para envío gratis (€)"}
            </Label>
            <div className="flex items-center">
              <Input
                id="valor"
                type="number"
                value={plantilla.valor}
                onChange={(e) => handleChange("valor", e.target.value)}
                min={1}
                className="w-32"
              />
              <span className="ml-2">
                {plantilla.tipo === "PORCENTAJE_DESCUENTO"
                  ? "%"
                  : plantilla.tipo === "CANTIDAD_FIJA" || plantilla.tipo === "ENVIO_GRATIS"
                    ? "€"
                    : ""}
              </span>
            </div>
          </div>

          {/* Código promocional */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="requiereCodigo">Requiere código promocional</Label>
              <Switch
                id="requiereCodigo"
                checked={plantilla.requiereCodigo}
                onCheckedChange={(checked) => handleChange("requiereCodigo", checked)}
              />
            </div>

            {plantilla.requiereCodigo && (
              <div>
                <Label htmlFor="codigo">Código promocional</Label>
                <Input
                  id="codigo"
                  value={plantilla.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Ej: VERANO2023"
                  className="uppercase"
                />
              </div>
            )}
          </div>

          {/* Fecha de fin */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tieneFechaFin">Tiene fecha de finalización</Label>
              <Switch
                id="tieneFechaFin"
                checked={plantilla.tieneFechaFin}
                onCheckedChange={(checked) => handleChange("tieneFechaFin", checked)}
              />
            </div>

            {plantilla.tieneFechaFin && (
              <div>
                <Label htmlFor="fechaFin">Fecha de finalización</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={plantilla.fechaFin instanceof Date ? plantilla.fechaFin.toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange("fechaFin", new Date(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Límite de usos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="limitarUsos">Limitar número de usos</Label>
              <Switch
                id="limitarUsos"
                checked={plantilla.limitarUsos}
                onCheckedChange={(checked) => handleChange("limitarUsos", checked)}
              />
            </div>

            {plantilla.limitarUsos && (
              <div>
                <Label htmlFor="limiteUsos">Número máximo de usos</Label>
                <Input
                  id="limiteUsos"
                  type="number"
                  value={plantilla.limiteUsos}
                  onChange={(e) => handleChange("limiteUsos", e.target.value)}
                  min={1}
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={enviando} className="bg-granito hover:bg-granito-dark">
              {enviando ? "Creando..." : "Crear promoción"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
