"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { ShoppingCart, Calendar } from "lucide-react"

interface FormularioCondicionesPromocionProps {
  compraMinima: string
  onChange: (datos: { compraMinima: string }) => void
}

export function FormularioCondicionesPromocion({ compraMinima, onChange }: FormularioCondicionesPromocionProps) {
  const [tieneCompraMinima, setTieneCompraMinima] = useState(!!compraMinima)

  const handleToggleCompraMinima = (checked: boolean) => {
    setTieneCompraMinima(checked)
    if (!checked) {
      onChange({ compraMinima: "" })
    }
  }

  const handleCambioCompraMinima = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ compraMinima: e.target.value })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Establece condiciones adicionales</h2>
      <p className="text-muted-foreground">
        Define requisitos adicionales para que los clientes puedan beneficiarse de esta promoción
      </p>

      <div className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-granito" />
              <Label htmlFor="compra-minima" className="font-medium">
                Compra mínima
              </Label>
            </div>
            <Switch
              id="tiene-compra-minima"
              checked={tieneCompraMinima}
              onCheckedChange={handleToggleCompraMinima}
              className="data-[state=checked]:bg-granito"
            />
          </div>

          {tieneCompraMinima && (
            <div className="ml-7 space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  id="compra-minima"
                  type="number"
                  placeholder="30.00"
                  value={compraMinima}
                  onChange={handleCambioCompraMinima}
                  min="0"
                  step="0.01"
                />
                <span className="text-lg font-medium">€</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Los clientes deberán gastar al menos esta cantidad para poder aplicar la promoción
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-800">Próximamente:</h3>
          </div>
          <p className="text-sm text-amber-700">En futuras actualizaciones podrás añadir más condiciones como:</p>
          <ul className="text-sm text-amber-700 list-disc list-inside mt-2 space-y-1">
            <li>Limitar la promoción a clientes específicos o grupos de clientes</li>
            <li>Establecer un número mínimo de productos en el carrito</li>
            <li>Crear promociones exclusivas para primeras compras</li>
            <li>Combinar promociones con otras ofertas</li>
          </ul>
        </div>

        <div className="p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
          <h3 className="text-sm font-medium text-granito-dark">Consejo:</h3>
          <p className="text-sm text-granito-dark/80">
            Establecer una compra mínima puede aumentar el valor medio del carrito. Intenta fijar un valor ligeramente
            superior al ticket medio de tu tienda.
          </p>
        </div>
      </div>
    </div>
  )
}
