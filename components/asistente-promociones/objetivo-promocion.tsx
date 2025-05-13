"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingCartIcon, TagIcon, PackageIcon } from "lucide-react"

export type ObjetivoPromocion = "CART" | "COLLECTION" | "PRODUCT"

interface FormularioObjetivoPromocionProps {
  valor: ObjetivoPromocion
  onChange: (objetivo: ObjetivoPromocion) => void
}

export function FormularioObjetivoPromocion({ valor, onChange }: FormularioObjetivoPromocionProps) {
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<ObjetivoPromocion>(valor || "CART")

  useEffect(() => {
    if (valor && valor !== objetivoSeleccionado) {
      setObjetivoSeleccionado(valor)
    }
  }, [valor])

  const handleChange = (value: ObjetivoPromocion) => {
    setObjetivoSeleccionado(value)
    onChange(value)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Objetivo de la promoción</h2>
      <p className="text-muted-foreground">Selecciona dónde se aplicará el descuento.</p>

      <RadioGroup
        value={objetivoSeleccionado}
        onValueChange={(value) => handleChange(value as ObjetivoPromocion)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
      >
        <div>
          <RadioGroupItem value="CART" id="carrito" className="peer sr-only" />
          <Label
            htmlFor="carrito"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <ShoppingCartIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Todo el carrito</p>
              <p className="text-sm text-muted-foreground">Aplica a toda la compra</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="COLLECTION" id="coleccion" className="peer sr-only" />
          <Label
            htmlFor="coleccion"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <TagIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Colección</p>
              <p className="text-sm text-muted-foreground">Aplica a una colección específica</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="PRODUCT" id="producto" className="peer sr-only" />
          <Label
            htmlFor="producto"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <PackageIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Producto</p>
              <p className="text-sm text-muted-foreground">Aplica a un producto específico</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {objetivoSeleccionado === "CART" && <ShoppingCartIcon className="h-5 w-5 text-primary" />}
            {objetivoSeleccionado === "COLLECTION" && <TagIcon className="h-5 w-5 text-primary" />}
            {objetivoSeleccionado === "PRODUCT" && <PackageIcon className="h-5 w-5 text-primary" />}
            <span className="font-medium">
              {objetivoSeleccionado === "CART" && "Todo el carrito"}
              {objetivoSeleccionado === "COLLECTION" && "Colección específica"}
              {objetivoSeleccionado === "PRODUCT" && "Producto específico"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {objetivoSeleccionado === "CART" &&
              "El descuento se aplicará a todo el carrito de compra. Ideal para promociones generales."}
            {objetivoSeleccionado === "COLLECTION" &&
              "El descuento se aplicará solo a los productos de una colección específica. Perfecto para promocionar categorías."}
            {objetivoSeleccionado === "PRODUCT" &&
              "El descuento se aplicará a un producto específico. Ideal para promocionar productos individuales."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Exportar también como SelectorObjetivoPromocion para mantener compatibilidad
export const SelectorObjetivoPromocion = FormularioObjetivoPromocion
