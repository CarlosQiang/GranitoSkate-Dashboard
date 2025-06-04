"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Percent, DollarSign, Gift, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Promocion {
  id: number
  shopify_id?: string
  titulo: string
  descripcion?: string
  tipo: string
  valor: number
  codigo?: string
  objetivo?: string
  objetivo_id?: string
  condiciones?: any
  fecha_inicio?: string
  fecha_fin?: string
  activa: boolean
  limite_uso?: number
  contador_uso?: number
  es_automatica: boolean
  fecha_creacion: string
  fecha_actualizacion?: string
}

interface PromocionesListClientProps {
  promociones: Promocion[]
  filter: string
}

export function PromocionesListClient({ promociones: initialPromociones, filter }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState<Promocion[]>(initialPromociones)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: number, titulo: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la promoción "${titulo}"?`)) {
      return
    }

    setIsDeleting(id)

    try {
      const response = await fetch(`/api/db/promociones/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la promoción")
      }

      setPromociones((prev) => prev.filter((p) => p.id !== id))

      toast({
        title: "Promoción eliminada",
        description: `La promoción "${titulo}" ha sido eliminada correctamente.`,
      })
    } catch (error) {
      console.error("Error deleting promocion:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadge = (promocion: Promocion) => {
    const now = new Date()
    const fechaInicio = promocion.fecha_inicio ? new Date(promocion.fecha_inicio) : null
    const fechaFin = promocion.fecha_fin ? new Date(promocion.fecha_fin) : null

    if (!promocion.activa) {
      return <Badge variant="secondary">Inactiva</Badge>
    }

    if (fechaInicio && fechaInicio > now) {
      return <Badge variant="outline">Programada</Badge>
    }

    if (fechaFin && fechaFin < now) {
      return <Badge variant="destructive">Expirada</Badge>
    }

    return <Badge variant="default">Activa</Badge>
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "porcentaje_descuento":
      case "percentage_discount":
        return <Percent className="h-4 w-4" />
      case "cantidad_fija_descuento":
      case "fixed_amount_discount":
        return <DollarSign className="h-4 w-4" />
      case "envio_gratis":
      case "free_shipping":
        return <Gift className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const formatValue = (promocion: Promocion) => {
    switch (promocion.tipo.toLowerCase()) {
      case "porcentaje_descuento":
      case "percentage_discount":
        return `${promocion.valor}% de descuento`
      case "cantidad_fija_descuento":
      case "fixed_amount_discount":
        return `${promocion.valor}€ de descuento`
      case "envio_gratis":
      case "free_shipping":
        return "Envío gratis"
      default:
        return `${promocion.valor}% de descuento`
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No definida"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (promociones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay promociones</h3>
        <p className="text-muted-foreground">
          {filter === "todas"
            ? "No se encontraron promociones en la base de datos."
            : `No hay promociones ${filter} en este momento.`}
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/promociones/asistente">Crear primera promoción</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {promociones.map((promocion) => (
        <Card key={promocion.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(promocion.tipo)}
                <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
              </div>
              {getStatusBadge(promocion)}
            </div>
            <CardDescription className="flex items-center gap-4">
              <span>{formatValue(promocion)}</span>
              {promocion.codigo && (
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{promocion.codigo}</span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Desde {formatDate(promocion.fecha_inicio)}
                    {promocion.fecha_fin && ` hasta ${formatDate(promocion.fecha_fin)}`}
                  </span>
                </div>

                {promocion.limite_uso && (
                  <div className="flex items-center gap-2">
                    <span>
                      Usos: {promocion.contador_uso || 0} / {promocion.limite_uso}
                    </span>
                  </div>
                )}

                {promocion.es_automatica && (
                  <Badge variant="outline" className="w-fit">
                    Automática
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/promociones/${promocion.id}`}>Ver detalles</Link>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/promociones/${promocion.id}/edit`}>Editar</Link>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(promocion.id, promocion.titulo)}
                  disabled={isDeleting === promocion.id}
                >
                  {isDeleting === promocion.id ? (
                    "Eliminando..."
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
