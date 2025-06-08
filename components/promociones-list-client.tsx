"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, AlertTriangle, Percent, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPromociones } from "@/lib/api/promociones"

interface PromocionesListClientProps {
  filter: string
}

export function PromocionesListClient({ filter }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadPromociones = async () => {
    // Evitar bucles infinitos
    if (retryCount >= 3) {
      setError(new Error("Demasiados intentos fallidos. Por favor, recarga la página."))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log(`🔍 Cargando promociones con filtro: ${filter}`)

      const data = await fetchPromociones(filter)
      console.log(`✅ Promociones cargadas:`, data)

      setPromociones(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("❌ Error al cargar promociones:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido"))
      setRetryCount((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromociones()
  }, [filter])

  const handleRetry = () => {
    setRetryCount(0)
    loadPromociones()
  }

  const getStatusBadge = (promocion: any) => {
    if (promocion.estado === "ACTIVE" || promocion.activa) {
      return <Badge variant="default">Activa</Badge>
    }
    if (promocion.estado === "SCHEDULED") {
      return <Badge variant="outline">Programada</Badge>
    }
    if (promocion.estado === "EXPIRED") {
      return <Badge variant="destructive">Expirada</Badge>
    }
    return <Badge variant="secondary">Inactiva</Badge>
  }

  const getValueDisplay = (promocion: any) => {
    const valor = promocion.valor || promocion.valorDescuento || 0
    const tipo = promocion.tipo || promocion.tipoDescuento

    if (tipo === "PORCENTAJE_DESCUENTO" || tipo === "PERCENTAGE") {
      return `${valor}% descuento`
    }
    if (tipo === "CANTIDAD_FIJA" || tipo === "FIXED_AMOUNT") {
      return `${valor}€ descuento`
    }
    if (tipo === "ENVIO_GRATIS" || tipo === "FREE_SHIPPING") {
      return "Envío gratis"
    }
    if (tipo === "COMPRA_X_LLEVA_Y" || tipo === "BUY_X_GET_Y") {
      return "Compra X lleva Y"
    }
    return "Descuento especial"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-3">
          <p>{error.message}</p>
          <Button variant="outline" size="sm" onClick={handleRetry} className="w-fit">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (promociones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No hay promociones</h3>
              <p className="text-sm">
                {filter === "todas"
                  ? "No hay promociones creadas."
                  : filter === "activas"
                    ? "No hay promociones activas."
                    : filter === "programadas"
                      ? "No hay promociones programadas."
                      : "No hay promociones expiradas."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
              <Button asChild>
                <Link href="/dashboard/promociones/asistente">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear promoción
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promociones.map((promocion) => (
        <Card key={promocion.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                {promocion.descripcion && <CardDescription className="mt-1">{promocion.descripcion}</CardDescription>}
              </div>
              {getStatusBadge(promocion)}
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
                <p>{getValueDisplay(promocion)}</p>
              </div>

              {(promocion.fechaInicio || promocion.fecha_inicio) && (
                <div>
                  <p className="font-medium">Inicio:</p>
                  <p>
                    {format(new Date(promocion.fechaInicio || promocion.fecha_inicio), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
              )}

              {(promocion.fechaFin || promocion.fecha_fin) && (
                <div>
                  <p className="font-medium">Fin:</p>
                  <p>{format(new Date(promocion.fechaFin || promocion.fecha_fin), "dd/MM/yyyy", { locale: es })}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/promociones/${promocion.id}`}>Ver</Link>
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
