import React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface PasosProps {
  pasoActual: number
  children: React.ReactNode
}

export function Pasos({ pasoActual, children }: PasosProps) {
  // Convertir los hijos a un array para poder manipularlos
  const pasos = React.Children.toArray(children)

  return (
    <div className="w-full">
      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pasos.map((paso, index) => {
          // Clonar el paso y pasarle las props necesarias
          return React.cloneElement(paso as React.ReactElement, {
            esActivo: pasoActual === index,
            esCompletado: pasoActual > index,
            numeroPaso: index + 1,
            key: index,
          })
        })}
      </ol>
    </div>
  )
}

interface PasoProps {
  titulo: string
  descripcion?: string
  icono?: React.ElementType
  esActivo?: boolean
  esCompletado?: boolean
  numeroPaso?: number
}

export function Paso({
  titulo,
  descripcion,
  icono: Icono,
  esActivo = false,
  esCompletado = false,
  numeroPaso,
}: PasoProps) {
  return (
    <li
      className={cn(
        "relative flex flex-col items-start p-4 border rounded-lg transition-colors",
        esActivo
          ? "border-granito bg-granito/5"
          : esCompletado
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-gray-50",
      )}
    >
      <div className="flex items-center mb-2">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full mr-3 text-white",
            esActivo ? "bg-granito" : esCompletado ? "bg-green-500" : "bg-gray-300",
          )}
        >
          {esCompletado ? <Check className="h-5 w-5" /> : numeroPaso}
        </div>
        <h3
          className={cn(
            "text-base font-medium",
            esActivo ? "text-granito" : esCompletado ? "text-green-700" : "text-gray-700",
          )}
        >
          {titulo}
        </h3>
      </div>
      {descripcion && <p className="text-sm text-gray-500 ml-11">{descripcion}</p>}
      {Icono && (
        <div className="absolute top-4 right-4 text-gray-400">
          <Icono className="h-5 w-5" />
        </div>
      )}
    </li>
  )
}
