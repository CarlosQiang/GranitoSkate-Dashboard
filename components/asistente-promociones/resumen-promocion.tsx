"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Percent,
  Tag,
  ShoppingBag,
  Truck,
  Calendar,
  Target,
  Code,
  ShoppingCart,
  FolderOpen,
  Package,
} from "lucide-react"
import type { DatosAsistentePromocion } from "@/types/promociones"

interface ResumenPromocionProps {
  datos: DatosAsistentePromocion
  onChange: (datos: Partial<DatosAsistentePromocion>) => void
}

export function ResumenPromocion({ datos, onChange }: ResumenPromocionProps) {
  const getIconoTipo = () => {
    switch (datos.tipo) {
      case "PORCENTAJE_DESCUENTO":
        return <Percent className="h-5 w-5 text-granito" />
      case "CANTIDAD_FIJA":
        return <Tag className="h-5 w-5 text-granito" />
      case "COMPRA_X_LLEVA_Y":
        return <ShoppingBag className="h-5 w-5 text-granito" />
      case "ENVIO_GRATIS":
        return <Truck className="h-5 w-5 text-granito" />
      default:
        return <Percent className="h-5 w-5 text-granito" />
    }
  }

  const getTextoTipo = () => {
    switch (datos.tipo) {
      case "PORCENTAJE_DESCUENTO":
        return `${datos.valor}% de descuento`
      case "CANTIDAD_FIJA":
        return `${datos.valor}€ de descuento`
      case "COMPRA_X_LLEVA_Y":
        return `Compra y llévate ${datos.valor} gratis`
      case "ENVIO_GRATIS":
        return `Envío gratuito (mín. ${datos.valor}€)`
      default:
        return "Descuento"
    }
  }

  const getIconoObjetivo = () => {
    switch (datos.objetivo) {
      case "CARRITO":
        return <ShoppingCart className="h-5 w-5 text-granito" />
      case "COLECCION":
        return <FolderOpen className="h-5 w-5 text-granito" />
      case "PRODUCTO":
        return <Package className="h-5 w-5 text-granito" />
      default:
        return <ShoppingCart className="h-5 w-5 text-granito" />
    }
  }

  const getTextoObjetivo = () => {
    switch (datos.objetivo) {
      case "CARRITO":
        return "Toda la tienda"
      case "COLECCION":
        return "Una colección específica"
      case "PRODUCTO":
        return "Un producto específico"
      default:
        return "Toda la tienda"
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Resumen de la promoción</h2>
      <p className="text-muted-foreground">Revisa los detalles de tu promoción y añade un título y descripción</p>

      <div className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título de la promoción</Label>
            <Input
              id="titulo"
              placeholder="Ej: Descuento de verano 20%"
              value={datos.titulo}
              onChange={(e) => onChange({ titulo: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">Un nombre claro y atractivo para tu promoción</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Aprovecha este descuento especial en todas nuestras tablas de skate"
              value={datos.descripcion}
              onChange={(e) => onChange({ descripcion: e.target.value })}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Una descripción detallada de la promoción para uso interno</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 border-b">
            <h3 className="font-medium">Detalles de la promoción</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tipo de descuento</div>
                <div className="flex items-center space-x-2">
                  {getIconoTipo()}
                  <span className="font-medium">{getTextoTipo()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Aplicado a</div>
                <div className="flex items-center space-x-2">
                  {getIconoObjetivo()}
                  <span className="font-medium">{getTextoObjetivo()}</span>
                </div>
              </div>

              {datos.compraMinima && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Compra mínima</div>
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5 text-granito" />
                    <span className="font-medium">{datos.compraMinima}€</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Periodo</div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-granito" />
                  <span className="font-medium">
                    {format(datos.fechaInicio, "dd MMM yyyy", { locale: es })}
                    {datos.tieneFechaFin
                      ? ` - ${format(datos.fechaFin, "dd MMM yyyy", { locale: es })}`
                      : " - Sin fecha fin"}
                  </span>
                </div>
              </div>

              {datos.limitarUsos && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Límite de usos</div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-granito" />
                    <span className="font-medium">{datos.limiteUsos} usos</span>
                  </div>
                </div>
              )}

              {datos.requiereCodigo && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Código promocional</div>
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-granito" />
                    <Badge variant="outline" className="text-base font-mono bg-granito/10 text-granito-dark">
                      {datos.codigo}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
          <h3 className="text-sm font-medium text-granito-dark">¡Todo listo!</h3>
          <p className="text-sm text-granito-dark/80">
            Tu promoción está lista para ser creada. Revisa todos los detalles y haz clic en "Crear promoción" para
            finalizar.
          </p>
        </div>
      </div>
    </div>
  )
}
