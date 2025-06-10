"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Percent, Tag, Users } from "lucide-react"
import Link from "next/link"

interface Promocion {
  id: string
  titulo: string
  descripcion?: string
  tipo: string
  valor: number | string
  codigo?: string
  fechaInicio: string
  fechaFin?: string | null
  activa: boolean
  limite_uso?: number | null
  contador_uso?: number
}

interface PromocionesListWrapperProps {
  filter: string
}

export function PromocionesListWrapper({ filter }: PromocionesListWrapperProps) {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPromociones() {
      try {
        setLoading(true)
        setError(null)

        // Usar la misma lógica que funciona en el dashboard
        const promocionesData = [
          {
            id: "1",
            titulo: "Descuento Verano 2024",
            descripcion: "20% de descuento en toda la tienda",
            tipo: "PORCENTAJE_DESCUENTO",
            valor: 20,
            codigo: "VERANO20",
            fechaInicio: "2024-06-01T00:00:00Z",
            fechaFin: "2024-08-31T23:59:59Z",
            activa: true,
            limite_uso: 100,
            contador_uso: 25,
          },
          {
            id: "2",
            titulo: "Envío Gratis",
            descripcion: "Envío gratuito en pedidos superiores a 50€",
            tipo: "ENVIO_GRATIS",
            valor: 0,
            codigo: "ENVIOGRATIS",
            fechaInicio: "2024-01-01T00:00:00Z",
            fechaFin: null,
            activa: true,
            limite_uso: null,
            contador_uso: 150,
          },
          {
            id: "3",
            titulo: "Black Friday",
            descripcion: "30% de descuento especial Black Friday",
            tipo: "PORCENTAJE_DESCUENTO",
            valor: 30,
            codigo: "BLACKFRIDAY30",
            fechaInicio: "2024-11-29T00:00:00Z",
            fechaFin: "2024-11-29T23:59:59Z",
            activa: false,
            limite_uso: 500,
            contador_uso: 0,
          },
        ]

        // Aplicar filtros
        let promocionesFiltradas = promocionesData
        if (filter === "activas") {
          promocionesFiltradas = promocionesData.filter((p) => p.activa === true)
        } else if (filter === "programadas") {
          const now = new Date()
          promocionesFiltradas = promocionesData.filter((p) => {
            const fechaInicio = new Date(p.fechaInicio)
            return fechaInicio > now
          })
        } else if (filter === "expiradas") {
          const now = new Date()
          promocionesFiltradas = promocionesData.filter((p) => {
            const fechaFin = p.fechaFin ? new Date(p.fechaFin) : null
            return fechaFin && fechaFin < now
          })
        }

        setPromociones(promocionesFiltradas)
      } catch (err) {
        console.error("Error cargando promociones:", err)
        setError("Error al cargar las promociones")
      } finally {
        setLoading(false)
      }
    }

    loadPromociones()
  }, [filter])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Cargando promociones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (promociones.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay promociones</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "todas" ? "No se encontraron promociones." : `No hay promociones ${filter} en este momento.`}
            </p>
            <Button asChild>
              <Link href="/dashboard/promociones/asistente">Crear nueva promoción</Link>
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
              <div>
                <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                <CardDescription className="mt-1">{promocion.descripcion}</CardDescription>
              </div>
              <Badge variant={promocion.activa ? "default" : "secondary"}>
                {promocion.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {promocion.tipo === "PORCENTAJE_DESCUENTO"
                    ? `${promocion.valor}% de descuento`
                    : promocion.tipo === "ENVIO_GRATIS"
                      ? "Envío gratuito"
                      : `${promocion.valor}€ de descuento`}
                </span>
              </div>

              {promocion.codigo && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm bg-muted px-2 py-1 rounded">{promocion.codigo}</code>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(promocion.fechaInicio).toLocaleDateString("es-ES")}
                  {promocion.fechaFin && ` - ${new Date(promocion.fechaFin).toLocaleDateString("es-ES")}`}
                </span>
              </div>

              {promocion.limite_uso && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {promocion.contador_uso || 0} / {promocion.limite_uso} usos
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/dashboard/promociones/${promocion.id}`}>Ver detalles</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/dashboard/promociones/${promocion.id}/edit`}>Editar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
