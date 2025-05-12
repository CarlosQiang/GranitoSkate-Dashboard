"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Percent, Tag, ShoppingBag, Truck } from "lucide-react"

interface TipoPromocionProps {
  value: string
  onChange: (value: string) => void
}

export function SelectorTipoPromocion({ value, onChange }: TipoPromocionProps) {
  const [selectedType, setSelectedType] = useState(value || "PORCENTAJE_DESCUENTO")

  const handleChange = (value: string) => {
    setSelectedType(value)
    onChange(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tipo de promoción</CardTitle>
        <CardDescription>Selecciona el tipo de descuento que quieres ofrecer a tus clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedType} onValueChange={handleChange} className="grid gap-4 md:grid-cols-2">
          <div>
            <RadioGroupItem value="PORCENTAJE_DESCUENTO" id="percentage" className="peer sr-only" />
            <Label
              htmlFor="percentage"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Percent className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Porcentaje de descuento</p>
                <p className="text-sm text-muted-foreground">Ej: 10% de descuento en toda la tienda</p>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="CANTIDAD_FIJA" id="fixed" className="peer sr-only" />
            <Label
              htmlFor="fixed"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Tag className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Cantidad fija</p>
                <p className="text-sm text-muted-foreground">Ej: 5€ de descuento en tu compra</p>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="ENVIO_GRATIS" id="shipping" className="peer sr-only" />
            <Label
              htmlFor="shipping"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Truck className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Envío gratis</p>
                <p className="text-sm text-muted-foreground">Ofrece envío gratuito a tus clientes</p>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="COMPRA_X_LLEVA_Y" id="buyxgety" className="peer sr-only" />
            <Label
              htmlFor="buyxgety"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <ShoppingBag className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Compra X y lleva Y</p>
                <p className="text-sm text-muted-foreground">Ej: Compra 2 y llévate 1 gratis</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
