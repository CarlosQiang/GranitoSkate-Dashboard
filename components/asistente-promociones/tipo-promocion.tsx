"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PercentIcon, CreditCardIcon, ShoppingBagIcon, PackageIcon } from "lucide-react"

export type TipoPromocion = "PORCENTAJE_DESCUENTO" | "CANTIDAD_FIJA" | "COMPRA_X_LLEVA_Y" | "ENVIO_GRATIS"

interface FormularioTipoPromocionProps {
  valor: TipoPromocion
  onChange: (tipo: TipoPromocion) => void
}

export function FormularioTipoPromocion({ valor, onChange }: FormularioTipoPromocionProps) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPromocion>(valor || "PORCENTAJE_DESCUENTO")

  useEffect(() => {
    if (valor && valor !== tipoSeleccionado) {
      setTipoSeleccionado(valor)
    }
  }, [valor])

  const handleChange = (value: TipoPromocion) => {
    setTipoSeleccionado(value)
    onChange(value)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tipo de promoción</h2>
      <p className="text-muted-foreground">Selecciona el tipo de descuento que quieres ofrecer a tus clientes.</p>

      <RadioGroup
        value={tipoSeleccionado}
        onValueChange={(value) => handleChange(value as TipoPromocion)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
      >
        <div>
          <RadioGroupItem value="PORCENTAJE_DESCUENTO" id="porcentaje" className="peer sr-only" />
          <Label
            htmlFor="porcentaje"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <PercentIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Porcentaje de descuento</p>
              <p className="text-sm text-muted-foreground">Ej: 10% de descuento en toda la tienda</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="CANTIDAD_FIJA" id="cantidad" className="peer sr-only" />
          <Label
            htmlFor="cantidad"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <CreditCardIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Cantidad fija</p>
              <p className="text-sm text-muted-foreground">Ej: 5€ de descuento en tu compra</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="COMPRA_X_LLEVA_Y" id="compra" className="peer sr-only" />
          <Label
            htmlFor="compra"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <ShoppingBagIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Compra X y lleva Y</p>
              <p className="text-sm text-muted-foreground">Ej: Compra 2 y lleva 3</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="ENVIO_GRATIS" id="envio" className="peer sr-only" />
          <Label
            htmlFor="envio"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <PackageIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Envío gratis</p>
              <p className="text-sm text-muted-foreground">Ej: Envío gratis en compras superiores a 50€</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {tipoSeleccionado === "PORCENTAJE_DESCUENTO" && <PercentIcon className="h-5 w-5 text-primary" />}
            {tipoSeleccionado === "CANTIDAD_FIJA" && <CreditCardIcon className="h-5 w-5 text-primary" />}
            {tipoSeleccionado === "COMPRA_X_LLEVA_Y" && <ShoppingBagIcon className="h-5 w-5 text-primary" />}
            {tipoSeleccionado === "ENVIO_GRATIS" && <PackageIcon className="h-5 w-5 text-primary" />}
            <span className="font-medium">
              {tipoSeleccionado === "PORCENTAJE_DESCUENTO" && "Porcentaje de descuento"}
              {tipoSeleccionado === "CANTIDAD_FIJA" && "Cantidad fija"}
              {tipoSeleccionado === "COMPRA_X_LLEVA_Y" && "Compra X y lleva Y"}
              {tipoSeleccionado === "ENVIO_GRATIS" && "Envío gratis"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {tipoSeleccionado === "PORCENTAJE_DESCUENTO" &&
              "Ofrece un descuento porcentual sobre el precio de los productos. Es ideal para promociones generales."}
            {tipoSeleccionado === "CANTIDAD_FIJA" &&
              "Aplica un descuento de una cantidad fija sobre el precio total. Perfecto para promociones con un valor concreto."}
            {tipoSeleccionado === "COMPRA_X_LLEVA_Y" &&
              "Permite a los clientes obtener productos adicionales al comprar una cantidad específica. Ideal para aumentar el volumen de ventas."}
            {tipoSeleccionado === "ENVIO_GRATIS" &&
              "Ofrece envío gratuito, opcionalmente con un mínimo de compra. Excelente para aumentar el valor del carrito."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Exportar también como SelectorTipoPromocion para mantener compatibilidad
export const SelectorTipoPromocion = FormularioTipoPromocion
