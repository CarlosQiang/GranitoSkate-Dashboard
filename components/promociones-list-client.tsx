"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit, Percent, Tag, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Importar la función que usa el Dashboard para obtener promociones
import { fetchDashboardData } from "@/lib/api/dashboard"

interface PromocionesListClientProps {
  filter?: string
}

export function PromocionesListClient({ filter = "todas" }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPromociones() {
      try {
        setLoading(true)
        setError(null)

        // Usar la misma función que el Dashboard
        const dashboardData = await fetchDashboardData()

        // Extraer promociones del dashboard
        let promocionesData = []
        if (dashboardData && dashboardData.stats && dashboardData.stats.promociones) {
          promocionesData = dashboardData.stats.promociones
          console.log(`✅ Promociones obtenidas del dashboard: ${promocionesData.length}`)
        }

        // Aplicar filtros si es necesario
        let filteredPromociones = promocionesData
        if (filter === "activas") {
          filteredPromociones = promocionesData.filter((p: any) => p.activa === true)
        } else if (filter === "programadas") {
          filteredPromociones = promocionesData.filter((p: any) => {
            const fechaInicio = new Date(p.fechaInicio)
            return fechaInicio > new Date()
          })
        } else if (filter === "expiradas") {
          filteredPromociones = promocionesData.filter((p: any) => {
            const fechaFin = p.fechaFin ? new Date(p.fechaFin) : null
            return fechaFin && fechaFin < new Date()
          })
        }

        console.log(`✅ Promociones filtradas (${filter}): ${filteredPromociones.length}`)
        setPromociones(filteredPromociones)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError("No se pudieron cargar las promociones. Intente nuevamente más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadPromociones()
  }, [filter])

  if (loading) {
    return <PromocionesLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (promociones.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay promociones</h3>
        <p className="mt-1 text-sm text-gray-500">No hay promociones creadas.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recargar
          </Button>
          <Button asChild>
            <Link href="/dashboard/promociones/asistente">Crear promoción</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promociones.map((promocion) => (
        <Card key={promocion.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
              <Badge variant={promocion.activa ? "default" : "outline"}>
                {promocion.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">{promocion.descripcion}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-sm">
                <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>
                  {promocion.tipo === "PORCENTAJE_DESCUENTO"
                    ? `${promocion.valor}% descuento`
                    : `${promocion.valor}€ descuento`}
                </span>
              </div>
              {promocion.codigo && (
                <div className="flex items-center text-sm">
                  <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                  <code className="bg-muted px-1 py-0.5 rounded">{promocion.codigo}</code>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5" />
                <span>
                  Desde:{" "}
                  {formatDistanceToNow(new Date(promocion.fechaInicio), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
              {promocion.fechaFin && (
                <div className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  <span>
                    Hasta:{" "}
                    {formatDistanceToNow(new Date(promocion.fechaFin), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/promociones/${promocion.id}`}>
                  <Edit className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                <Trash className="mr-1 h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function PromocionesLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
