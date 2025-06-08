"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingCartIcon, TagIcon, UsersIcon, GlobeIcon } from "lucide-react"

export type ObjetivoPromocion =
  | "TODOS_LOS_PRODUCTOS"
  | "PRODUCTOS_ESPECIFICOS"
  | "COLECCIONES_ESPECIFICAS"
  | "CLIENTES_ESPECIFICOS"

interface FormularioObjetivoPromocionProps {
  objetivo: string
  onChange: (objetivo: string) => void
}

export function FormularioObjetivoPromocion({ objetivo, onChange }: FormularioObjetivoPromocionProps) {
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<ObjetivoPromocion>(
    (objetivo as ObjetivoPromocion) || "TODOS_LOS_PRODUCTOS",
  )

  useEffect(() => {
    if (objetivo && objetivo !== objetivoSeleccionado) {
      setObjetivoSeleccionado(objetivo as ObjetivoPromocion)
    }
  }, [objetivo])

  const handleChange = (value: ObjetivoPromocion) => {
    setObjetivoSeleccionado(value)
    onChange(value)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Objetivo de la promoción</h2>
      <p className="text-muted-foreground">Define a qué productos o clientes se aplicará esta promoción.</p>

      <RadioGroup
        value={objetivoSeleccionado}
        onValueChange={(value) => handleChange(value as ObjetivoPromocion)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
      >
        <div>
          <RadioGroupItem value="TODOS_LOS_PRODUCTOS" id="todos" className="peer sr-only" />
          <Label
            htmlFor="todos"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <GlobeIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Todos los productos</p>
              <p className="text-sm text-muted-foreground">Aplicar a toda la tienda</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="PRODUCTOS_ESPECIFICOS" id="productos" className="peer sr-only" />
          <Label
            htmlFor="productos"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <ShoppingCartIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Productos específicos</p>
              <p className="text-sm text-muted-foreground">Seleccionar productos individuales</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="COLECCIONES_ESPECIFICAS" id="colecciones" className="peer sr-only" />
          <Label
            htmlFor="colecciones"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <TagIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Colecciones específicas</p>
              <p className="text-sm text-muted-foreground">Aplicar a colecciones completas</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="CLIENTES_ESPECIFICOS" id="clientes" className="peer sr-only" />
          <Label
            htmlFor="clientes"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <UsersIcon className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Clientes específicos</p>
              <p className="text-sm text-muted-foreground">Solo para clientes seleccionados</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {objetivoSeleccionado === "TODOS_LOS_PRODUCTOS" && <GlobeIcon className="h-5 w-5 text-primary" />}
            {objetivoSeleccionado === "PRODUCTOS_ESPECIFICOS" && <ShoppingCartIcon className="h-5 w-5 text-primary" />}
            {objetivoSeleccionado === "COLECCIONES_ESPECIFICAS" && <TagIcon className="h-5 w-5 text-primary" />}
            {objetivoSeleccionado === "CLIENTES_ESPECIFICOS" && <UsersIcon className="h-5 w-5 text-primary" />}
            <span className="font-medium">
              {objetivoSeleccionado === "TODOS_LOS_PRODUCTOS" && "Todos los productos"}
              {objetivoSeleccionado === "PRODUCTOS_ESPECIFICOS" && "Productos específicos"}
              {objetivoSeleccionado === "COLECCIONES_ESPECIFICAS" && "Colecciones específicas"}
              {objetivoSeleccionado === "CLIENTES_ESPECIFICOS" && "Clientes específicos"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {objetivoSeleccionado === "TODOS_LOS_PRODUCTOS" &&
              "La promoción se aplicará a todos los productos de tu tienda sin excepción."}
            {objetivoSeleccionado === "PRODUCTOS_ESPECIFICOS" &&
              "Podrás seleccionar productos individuales para aplicar la promoción."}
            {objetivoSeleccionado === "COLECCIONES_ESPECIFICAS" &&
              "La promoción se aplicará a todas las colecciones que selecciones."}
            {objetivoSeleccionado === "CLIENTES_ESPECIFICOS" &&
              "Solo los clientes que selecciones podrán usar esta promoción."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
