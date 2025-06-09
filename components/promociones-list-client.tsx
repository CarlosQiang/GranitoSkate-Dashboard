"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Percent, Users, ShoppingBag, Edit } from "lucide-react"
import Link from "next/link"

interface Promocion {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  valor: number
  codigo?: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
  usos_maximos?: number
  usos_actuales?: number
  productos_aplicables?: string[]
  colecciones_aplicables?: string[]
}

interface PromocionesListClientProps {
  filter: "todas" | "activas" | "programadas" | "expiradas"
}

export function PromocionesListClient({ filter }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPromociones()
  }, [filter])

  const loadPromociones = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/db/promociones", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Error al cargar promociones")
      }

      const data = await response.json()
      let filteredPromociones = data.promociones || []

      // Aplicar filtro
      const now = new Date()
      switch (filter) {
        case "activas":
          filteredPromociones = filteredPromociones.filter((p: Promocion) => {
            const inicio = new Date(p.fecha_inicio)
            const fin = new Date(p.fecha_fin)
            return inicio <= now && fin >= now && p.estado === "activa"
          })
          break
        case "programadas":
          filteredPromociones = filteredPromociones.filter((p: Promocion) => {
            const inicio = new Date(p.fecha_inicio)
            return inicio > now && p.estado === "programada"
          })
          break
        case "expiradas":
          filteredPromociones = filteredPromociones.filter((p: Promocion) => {
            const fin = new Date(p.fecha_fin)
            return fin < now || p.estado === "expirada"
          })
          break
        default:
          // Todas las promociones
          break
      }

      setPromociones(filteredPromociones)
    } catch (err) {
      console.error("Error loading promociones:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoBadge = (promocion: Promocion) => {
    const now = new Date()
    const inicio = new Date(promocion.fecha_inicio)
    const fin = new Date(promocion.fecha_fin)

    if (inicio > now) {
      return <Badge variant="secondary">Programada</Badge>
    } else if (fin < now) {
      return <Badge variant="destructive">Expirada</Badge>
    } else {
      return <Badge variant="default">Activa</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
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

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error al cargar promociones: {error}</p>
            <Button onClick={loadPromociones} className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (promociones.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Percent className="mx-auto h-12 w-12 mb-4" />
            <p>No hay promociones {filter === "todas" ? "" : filter} disponibles</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/promociones/asistente">Crear primera promoción</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promociones.map((promocion) => (
        <Card key={promocion.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                <CardDescription className="line-clamp-2">{promocion.descripcion}</CardDescription>
              </div>
              {getEstadoBadge(promocion)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  {promocion.tipo === "porcentaje" ? `${promocion.valor}%` : `€${promocion.valor}`}
                </span>
                {promocion.codigo && (
                  <Badge variant="outline" className="font-mono">
                    {promocion.codigo}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(promocion.fecha_inicio)}
                </span>
                <span>-</span>
                <span>{formatDate(promocion.fecha_fin)}</span>
              </div>

              {promocion.usos_maximos && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {promocion.usos_actuales || 0} / {promocion.usos_maximos} usos
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/dashboard/promociones/${promocion.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Ver detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
