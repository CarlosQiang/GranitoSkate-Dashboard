"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import type { TipoPromocion } from "@/types/promociones"

interface FormularioValorPromocionProps {
  tipo: TipoPromocion
  valor: string
  onChange: (valor: string) => void
}

export function FormularioValorPromocion({ tipo, valor, onChange }: FormularioValorPromocionProps) {
  const [valorSlider, setValorSlider] = useState<number>(Number(valor) || 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Actualizar slider cuando el valor cambia externamente
    setValorSlider(Number(valor) || 0)
  }, [valor])

  const handleSliderChange = (nuevoValor: number[]) => {
    const value = nuevoValor[0]
    setValorSlider(value)

    // Validar que el valor sea mayor que cero
    if (value <= 0) {
      setError("El valor debe ser mayor que cero")
    } else {
      setError(null)
      onChange(value.toString())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.value
    const numericValue = Number(nuevoValor)

    // Validar que el valor sea mayor que cero
    if (numericValue <= 0) {
      setError("El valor debe ser mayor que cero")
    } else {
      setError(null)
    }

    onChange(nuevoValor)
    setValorSlider(numericValue || 0)
  }

  const getValorMaximo = () => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return 100
      case "CANTIDAD_FIJA":
        return 200
      case "COMPRA_X_LLEVA_Y":
        return 5
      case "ENVIO_GRATIS":
        return 100
      default:
        return 100
    }
  }

  const getValorPaso = () => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return 5
      case "CANTIDAD_FIJA":
        return 5
      case "COMPRA_X_LLEVA_Y":
        return 1
      case "ENVIO_GRATIS":
        return 10
      default:
        return 5
    }
  }

  const getEtiquetaValor = () => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return "Porcentaje de descuento"
      case "CANTIDAD_FIJA":
        return "Cantidad a descontar (€)"
      case "COMPRA_X_LLEVA_Y":
        return "Cantidad de productos gratis"
      case "ENVIO_GRATIS":
        return "Valor mínimo para envío gratis (€)"
      default:
        return "Valor"
    }
  }

  const getDescripcionValor = () => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return "Porcentaje que se descontará del precio original"
      case "CANTIDAD_FIJA":
        return "Cantidad fija que se descontará del precio"
      case "COMPRA_X_LLEVA_Y":
        return "Número de productos que el cliente recibirá gratis"
      case "ENVIO_GRATIS":
        return "Valor mínimo de compra para aplicar envío gratuito"
      default:
        return ""
    }
  }

  const getSufijoValor = () => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return "%"
      case "CANTIDAD_FIJA":
        return "€"
      case "COMPRA_X_LLEVA_Y":
        return ""
      case "ENVIO_GRATIS":
        return "€"
      default:
        return ""
    }
  }

  const getTextoEjemplo = () => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return `Con un ${valorSlider}% de descuento, un producto de 100€ costaría ${100 - valorSlider}€`
      case "CANTIDAD_FIJA":
        return `Con un descuento de ${valorSlider}€, un producto de 100€ costaría ${100 - valorSlider}€`
      case "COMPRA_X_LLEVA_Y":
        return `El cliente recibirá ${valorSlider} producto${valorSlider !== 1 ? "s" : ""} gratis al realizar su compra`
      case "ENVIO_GRATIS":
        return `El cliente recibirá envío gratuito en compras superiores a ${valorSlider}€`
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Define el valor del descuento</h2>
      <p className="text-muted-foreground">Establece cuánto descuento quieres ofrecer a tus clientes</p>

      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="valor-descuento">{getEtiquetaValor()}</Label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Slider
                value={[valorSlider]}
                min={1} // Mínimo valor es 1 para evitar errores
                max={getValorMaximo()}
                step={getValorPaso()}
                onValueChange={handleSliderChange}
                className="[&_[role=slider]]:bg-granito [&_[role=slider]]:border-granito [&_[role=slider]]:focus:ring-granito [&_[role=slider]]:focus-visible:ring-granito [&_[data-orientation=horizontal]]:bg-granito"
              />
            </div>
            <div className="w-20 flex items-center">
              <Input
                id="valor-descuento"
                type="number"
                value={valor}
                onChange={handleInputChange}
                min={1} // Mínimo valor es 1 para evitar errores
                max={getValorMaximo()}
                step={tipo === "CANTIDAD_FIJA" ? "0.01" : "1"}
                className={`w-full ${error ? "border-red-500" : ""}`}
              />
              <span className="ml-2">{getSufijoValor()}</span>
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{getDescripcionValor()}</p>
          )}
        </div>

        <div className="p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
          <h3 className="text-sm font-medium text-granito-dark">Ejemplo:</h3>
          <p className="text-sm text-granito-dark/80">{getTextoEjemplo()}</p>
        </div>

        <div className="p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
          <h3 className="text-sm font-medium text-granito-dark">Consejo:</h3>
          <p className="text-sm text-granito-dark/80">
            {tipo === "PORCENTAJE_DESCUENTO" &&
              "Los descuentos entre 10% y 30% suelen tener el mejor equilibrio entre atractivo para el cliente y rentabilidad."}
            {tipo === "CANTIDAD_FIJA" &&
              "Los descuentos de cantidad fija son más efectivos cuando representan al menos un 10% del valor medio de compra."}
            {tipo === "COMPRA_X_LLEVA_Y" &&
              "Las promociones de 'compra 1 y llévate 1 gratis' (2x1) son las más populares y fáciles de entender para los clientes."}
            {tipo === "ENVIO_GRATIS" &&
              "El envío gratuito es uno de los incentivos más efectivos para aumentar el valor medio del carrito."}
          </p>
        </div>
      </div>
    </div>
  )
}
