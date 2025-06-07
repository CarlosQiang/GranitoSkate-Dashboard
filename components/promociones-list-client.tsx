"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { obtenerPromociones } from "@/lib/api/promociones"

interface PromocionesListClientProps {
  filter: string
  initialPromociones?: any[]
}

export function PromocionesListClient({ filter, initialPromociones = [] }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState(initialPromociones)
  const [loading, setLoading] = useState(!initialPromociones.length)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!initialPromociones.length) {
      fetchPromociones()
    }
  }, [filter, initialPromociones])

  const fetchPromociones = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await obtenerPromociones(filter)
      setPromociones(data)
    } catch (err) {
      console.error("Error al cargar promociones:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar promociones"))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error al cargar promociones
          </CardTitle>
          <CardDescription>No se pudieron cargar las promociones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Error: {error.message}</p>
          <Button onClick={fetchPromociones} variant="outline">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (promociones.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No hay promociones</CardTitle>
          <CardDescription>
            {filter === "todas"
              ? "No hay promociones creadas."
              : filter === "activas"
                ? "No hay promociones activas."
                : filter === "programadas"
                  ? "No hay promociones programadas."
                  : "No hay promociones expiradas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/promociones/asistente">Crear nueva promoción</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promociones.map((promocion) => (
        <Card key={promocion.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                <CardDescription className="mt-1">{promocion.descripcion}</CardDescription>
              </div>
              <Badge
                variant={
                  promocion.estado === "ACTIVE" ? "default" : promocion.estado === "SCHEDULED" ? "outline" : "secondary"
                }
              >
                {promocion.estado === "ACTIVE"
                  ? "Activa"
                  : promocion.estado === "SCHEDULED"
                    ? "Programada"
                    : "Expirada"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {promocion.codigo && (
              <div>
                <p className="text-sm font-medium">Código:</p>
                <p className="text-sm font-mono bg-muted p-1 rounded">{promocion.codigo}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Tipo:</p>
                <p>
                  {promocion.tipoDescuento === "PERCENTAGE"
                    ? "Porcentaje"
                    : promocion.tipoDescuento === "FIXED_AMOUNT"
                      ? "Monto fijo"
                      : promocion.tipoDescuento === "FREE_SHIPPING"
                        ? "Envío gratis"
                        : promocion.tipoDescuento === "BUY_X_GET_Y"
                          ? "Compra X lleva Y"
                          : "Automático"}
                </p>
              </div>
              <div>
                <p className="font-medium">Valor:</p>
                <p>
                  {promocion.valorDescuento
                    ? promocion.tipoDescuento === "PERCENTAGE"
                      ? `${promocion.valorDescuento}%`
                      : promocion.tipoDescuento === "FIXED_AMOUNT"
                        ? `$${promocion.valorDescuento}`
                        : promocion.valorDescuento
                    : "N/A"}
                </p>
              </div>
              {promocion.fechaInicio && (
                <div>
                  <p className="font-medium">Inicio:</p>
                  <p>{format(new Date(promocion.fechaInicio), "dd/MM/yyyy", { locale: es })}</p>
                </div>
              )}
              {promocion.fechaFin && (
                <div>
                  <p className="font-medium">Fin:</p>
                  <p>{format(new Date(promocion.fechaFin), "dd/MM/yyyy", { locale: es })}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/promociones/${promocion.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Ver
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/promociones/${promocion.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
