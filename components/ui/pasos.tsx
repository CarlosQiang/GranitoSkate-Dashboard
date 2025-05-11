import React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

// Componente para mostrar una secuencia de pasos
// Lo usamos en el asistente de promociones y podría reutilizarse en otros asistentes
interface PasosProps {
  pasoActual: number
  children: React.ReactNode
}

export function Pasos({ pasoActual, children }: PasosProps) {
  // Convertimos los hijos a un array para poder manipularlos
  const childrenArray = React.Children.toArray(children)

  // Renderizamos la lista de pasos
  return (
    <div className="w-full">
      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {childrenArray.map((child, index) => {
          // Solo procesamos elementos válidos de React
          if (React.isValidElement(child)) {
            // Clonamos el elemento y le añadimos las props necesarias
            return React.cloneElement(child as React.ReactElement<PasoProps>, {
              numeroPaso: index + 1,
              esActivo: pasoActual === index,
              esCompletado: pasoActual > index,
            })
          }
          return child
        })}
      </ol>
    </div>
  )
}

// Props para cada paso individual
interface PasoProps {
  titulo: string
  descripcion?: string
  icono?: LucideIcon
  esActivo?: boolean
  esCompletado?: boolean
  numeroPaso?: number
}

// Componente para un paso individual
export function Paso({
  titulo,
  descripcion,
  icono: Icono,
  esActivo = false,
  esCompletado = false,
  numeroPaso,
}: PasoProps) {
  // Estilos dinámicos según el estado del paso
  const estiloContenedor = cn(
    "relative flex flex-col items-start p-4 border rounded-lg transition-all",
    esActivo ? "border-granito bg-granito/5" : "border-muted",
    esCompletado ? "border-granito/50 bg-granito-light/10" : "",
  )

  const estiloIcono = cn(
    "flex items-center justify-center w-8 h-8 rounded-full mr-2 text-white",
    esActivo ? "bg-granito" : esCompletado ? "bg-granito-light" : "bg-muted-foreground",
  )

  const estiloTitulo = cn(
    "text-base font-medium",
    esActivo ? "text-granito" : esCompletado ? "text-granito-dark" : "text-muted-foreground",
  )

  return (
    <li className={estiloContenedor}>
      <div className="flex items-center mb-1">
        <div className={estiloIcono}>{Icono ? <Icono className="h-4 w-4" /> : <span>{numeroPaso}</span>}</div>
        <h3 className={estiloTitulo}>{titulo}</h3>
      </div>
      {descripcion && <p className="text-sm text-muted-foreground ml-10">{descripcion}</p>}
    </li>
  )
}
