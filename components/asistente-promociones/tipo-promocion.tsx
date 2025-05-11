"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Percent, Tag, ShoppingBag, Truck } from "lucide-react"
import type { TipoPromocion } from "@/types/promociones"

// Props del componente
interface SelectorTipoPromocionProps {
  valor: TipoPromocion
  onChange: (valor: TipoPromocion) => void
}

/**
 * Componente para seleccionar el tipo de promoción
 *
 * @param {TipoPromocion} valor - El tipo de promoción seleccionado actualmente
 * @param {Function} onChange - Función para actualizar el tipo seleccionado
 */
export function SelectorTipoPromocion({ valor, onChange }: SelectorTipoPromocionProps) {
  // Opciones de tipos de promoción
  const tiposPromocion = [
    {
      id: "porcentaje",
      valor: "PORCENTAJE_DESCUENTO" as TipoPromocion,
      titulo: "Descuento porcentual",
      descripcion: "Ej: 20% de descuento en productos",
      icono: Percent,
    },
    {
      id: "fijo",
      valor: "CANTIDAD_FIJA" as TipoPromocion,
      titulo: "Descuento de cantidad fija",
      descripcion: "Ej: 10€ de descuento en la compra",
      icono: Tag,
    },
    {
      id: "compraylleva",
      valor: "COMPRA_X_LLEVA_Y" as TipoPromocion,
      titulo: "Compra X y llévate Y",
      descripcion: "Ej: 2x1 en productos seleccionados",
      icono: ShoppingBag,
    },
    {
      id: "envio",
      valor: "ENVIO_GRATIS" as TipoPromocion,
      titulo: "Envío gratuito",
      descripcion: "Sin costes de envío en pedidos",
      icono: Truck,
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">¿Qué tipo de descuento quieres ofrecer?</h2>
      <p className="text-muted-foreground">
        Elige el tipo de descuento que mejor se adapte a tu estrategia de marketing
      </p>

      <RadioGroup
        value={valor}
        onValueChange={(val) => onChange(val as TipoPromocion)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
      >
        {tiposPromocion.map((tipo) => (
          <div
            key={tipo.id}
            className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50"
          >
            <RadioGroupItem value={tipo.valor} id={tipo.id} />
            <Label htmlFor={tipo.id} className="flex items-center cursor-pointer">
              <tipo.icono className="h-5 w-5 mr-2 text-granito" />
              <div>
                <p className="font-medium">{tipo.titulo}</p>
                <p className="text-sm text-muted-foreground">{tipo.descripcion}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Consejo para el usuario */}
      <div className="mt-4 p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
        <h3 className="text-sm font-medium text-granito-dark">Consejo:</h3>
        <p className="text-sm text-granito-dark/80">
          Los descuentos porcentuales son ideales para promociones generales, mientras que los descuentos de cantidad
          fija son mejores para compras de mayor valor.
        </p>
      </div>
    </div>
  )
}
