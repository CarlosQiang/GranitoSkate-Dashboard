"use client"

import { PromocionesListClient } from "./promociones-list-client"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PromocionesListWrapperProps {
  filter: "todas" | "activas" | "programadas" | "expiradas"
}

async function fetchPromociones(filter: string) {
  try {
    console.log(`🔍 Obteniendo promociones con filtro: ${filter}`)

    // Primero intentar obtener de la base de datos local
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/db/promociones`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    let promociones = []

    if (response.ok) {
      promociones = await response.json()
      console.log(`📊 Promociones de BD local: ${promociones.length}`)
    }

    // Si no hay promociones en la BD local, intentar obtener de Shopify
    if (promociones.length === 0) {
      console.log("🔄 Obteniendo promociones de Shopify...")

      const shopifyResponse = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/shopify/promotions`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success && shopifyData.promociones) {
          promociones = shopifyData.promociones
          console.log(`📊 Promociones de Shopify: ${promociones.length}`)
        }
      }
    }

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
    console.error("❌ Error fetching promociones:", error)
    throw error
  }
}

export async function PromocionesListWrapper({ filter }: PromocionesListWrapperProps) {
  try {
    const promociones = await fetchPromociones(filter)
    return <PromocionesListClient promociones={promociones} filter={filter} />
  } catch (error) {
    console.error("❌ Error en PromocionesListWrapper:", error)

    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive">Error al cargar promociones</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Ha ocurrido un error inesperado"}
        </p>
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
}
