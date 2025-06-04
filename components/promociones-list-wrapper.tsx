import { PromocionesListClient } from "./promociones-list-client"

interface PromocionesListWrapperProps {
  filter: "todas" | "activas" | "programadas" | "expiradas"
}

async function fetchPromociones(filter: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/db/promociones`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error al cargar promociones: ${response.status}`)
    }

    const promociones = await response.json()

    // Filtrar según el tipo solicitado
    const now = new Date()

    switch (filter) {
      case "activas":
        return promociones.filter((promo: any) => {
          const fechaInicio = promo.fecha_inicio ? new Date(promo.fecha_inicio) : null
          const fechaFin = promo.fecha_fin ? new Date(promo.fecha_fin) : null

          return promo.activa && (!fechaInicio || fechaInicio <= now) && (!fechaFin || fechaFin >= now)
        })

      case "programadas":
        return promociones.filter((promo: any) => {
          const fechaInicio = promo.fecha_inicio ? new Date(promo.fecha_inicio) : null
          return promo.activa && fechaInicio && fechaInicio > now
        })

      case "expiradas":
        return promociones.filter((promo: any) => {
          const fechaFin = promo.fecha_fin ? new Date(promo.fecha_fin) : null
          return !promo.activa || (fechaFin && fechaFin < now)
        })

      default:
        return promociones
    }
  } catch (error) {
    console.error("Error fetching promociones:", error)
    return []
  }
}

export async function PromocionesListWrapper({ filter }: PromocionesListWrapperProps) {
  const promociones = await fetchPromociones(filter)

  return <PromocionesListClient promociones={promociones} filter={filter} />
}
