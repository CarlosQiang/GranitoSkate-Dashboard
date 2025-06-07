"use client"

import { PromocionesListClient } from "./promociones-list-client"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

interface PromocionesListWrapperProps {
  filter: "todas" | "activas" | "programadas" | "expiradas"
}

export function PromocionesListWrapper({ filter }: PromocionesListWrapperProps) {
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPromociones() {
      try {
        console.log(`🔍 Obteniendo promociones con filtro: ${filter}`)
        setLoading(true)
        setError(null)

        // Usar la URL relativa para evitar problemas de CORS
        const response = await fetch(`/api/db/promociones`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error al obtener promociones: ${response.status}`)
        }

        const data = await response.json()
        console.log(`📊 Promociones obtenidas: ${data.length || 0}`)

        // Filtrar según el tipo solicitado
        const now = new Date()
        let filteredPromociones = data

        switch (filter) {
          case "activas":
            filteredPromociones = data.filter((promo: any) => {
              const fechaInicio = promo.fecha_inicio ? new Date(promo.fecha_inicio) : null
              const fechaFin = promo.fecha_fin ? new Date(promo.fecha_fin) : null

              return promo.activa && (!fechaInicio || fechaInicio <= now) && (!fechaFin || fechaFin >= now)
            })
            break

          case "programadas":
            filteredPromociones = data.filter((promo: any) => {
              const fechaInicio = promo.fecha_inicio ? new Date(promo.fecha_inicio) : null
              return promo.activa && fechaInicio && fechaInicio > now
            })
            break

          case "expiradas":
            filteredPromociones = data.filter((promo: any) => {
              const fechaFin = promo.fecha_fin ? new Date(promo.fecha_fin) : null
              return !promo.activa || (fechaFin && fechaFin < now)
            })
            break
        }

        setPromociones(filteredPromociones)
      } catch (err) {
        console.error("❌ Error fetching promociones:", err)
        setError(err instanceof Error ? err : new Error("Error desconocido"))

        // Si hay un error, intentar obtener promociones directamente de Shopify
        try {
          console.log("🔄 Intentando obtener promociones de Shopify...")

          const shopifyResponse = await fetch(`/api/shopify/promotions`, {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!shopifyResponse.ok) {
            throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
          }

          const shopifyData = await shopifyResponse.json()

          if (shopifyData.success && shopifyData.promociones) {
            console.log(`📊 Promociones de Shopify: ${shopifyData.promociones.length}`)
            setPromociones(shopifyData.promociones)
            setError(null) // Limpiar el error si la recuperación fue exitosa
          }
        } catch (shopifyErr) {
          console.error("❌ Error obteniendo promociones de Shopify:", shopifyErr)
          // Mantener el error original
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPromociones()
  }, [filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Cargando promociones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive">Error al cargar promociones</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            Reintentar
          </Button>
          <Button asChild>
            <Link href="/dashboard/promociones/asistente">Crear promoción</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <PromocionesListClient promociones={promociones} filter={filter} />
}
