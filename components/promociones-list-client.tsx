"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchPromociones } from "@/lib/api/promociones"
import { extractShopifyId } from "@/lib/utils/shopify-id"
import { Loader2, Plus, Eye, Edit, AlertTriangle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Promocion {
  id: string
  titulo?: string
  title?: string
  descripcion?: string
  description?: string
  tipo?: string
  valueType?: string
  valor?: number | string
  value?: number | string
  fechaInicio?: string
  startsAt?: string
  fechaFin?: string | null
  endsAt?: string | null
  codigo?: string | null
  code?: string | null
  activa?: boolean
  status?: string
  usageCount?: number
  usageLimit?: number
}

interface PromocionesListClientProps {
  filter: string
}

export function PromocionesListClient({ filter }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPromociones = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔍 Cargando promociones con filtro: ${filter}`)

      const data = await fetchPromociones(filter)
      console.log(`✅ Promociones cargadas:`, data)

      // Asegurar que data es un array
      const promocionesArray = Array.isArray(data) ? data : []
      setPromociones(promocionesArray)
    } catch (err) {
      console.error("❌ Error al cargar promociones:", err)
      setError("Error al cargar promociones. Intente nuevamente.")
      setPromociones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPromociones()
  }, [filter])

  // Función para obtener el título de manera segura
  const obtenerTitulo = (promocion: Promocion): string => {
    return promocion?.titulo || promocion?.title || "Sin título"
  }

  // Función para obtener la descripción de manera segura
  const obtenerDescripcion = (promocion: Promocion): string => {
    return promocion?.descripcion || promocion?.description || "Sin descripción"
  }

  // Función para obtener el valor de manera segura
  const obtenerValor = (promocion: Promocion): string => {
    const valor = promocion?.valor || promocion?.value || 0
    const tipo = promocion?.tipo || promocion?.valueType || "PERCENTAGE_DISCOUNT"

    if (tipo === "PERCENTAGE_DISCOUNT" || tipo === "percentage") {
      return `${valor}%`
    } else if (tipo === "FIXED_AMOUNT_DISCOUNT" || tipo === "fixed_amount") {
      return `€${valor}`
    } else if (tipo === "FREE_SHIPPING" || tipo === "free_shipping") {
      return "Envío gratis"
    }
    return `${valor}`
  }

  // Función para obtener el estado de manera segura
  const obtenerEstado = (
    promocion: Promocion,
  ): { texto: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (promocion?.activa === true || promocion?.status === "active") {
      return { texto: "Activa", variant: "default" }
    } else if (promocion?.status === "expired") {
      return { texto: "Expirada", variant: "destructive" }
    } else if (promocion?.status === "scheduled") {
      return { texto: "Programada", variant: "secondary" }
    } else {
      return { texto: "Inactiva", variant: "outline" }
    }
  }

  // Función para obtener las fechas de manera segura
  const obtenerFechas = (promocion: Promocion): string => {
    const fechaInicio = promocion?.fechaInicio || promocion?.startsAt
    const fechaFin = promocion?.fechaFin || promocion?.endsAt

    if (!fechaInicio) return "Sin fecha"

    try {
      const inicio = new Date(fechaInicio).toLocaleDateString()
      if (fechaFin) {
        const fin = new Date(fechaFin).toLocaleDateString()
        return `${inicio} - ${fin}`
      }
      return `Desde ${inicio}`
    } catch {
      return "Fecha inválida"
    }
  }

  // Función para obtener el ID limpio
  const obtenerIdLimpio = (promocion: Promocion): string => {
    if (!promocion?.id) return ""
    return extractShopifyId(promocion.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando promociones...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-3">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={cargarPromociones} className="w-fit">
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
              <Button variant="outline" onClick={cargarPromociones}>
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
      {promociones.map((promocion) => {
        if (!promocion) return null

        const estado = obtenerEstado(promocion)
        const idLimpio = obtenerIdLimpio(promocion)

        // Si no podemos obtener un ID válido, no mostrar la promoción
        if (!idLimpio) {
          console.warn("Promoción sin ID válido:", promocion)
          return null
        }

        return (
          <Card key={promocion.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{obtenerTitulo(promocion)}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">{obtenerDescripcion(promocion)}</CardDescription>
                </div>
                <Badge variant={estado.variant}>{estado.texto}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Descuento:</p>
                  <p className="text-granito font-semibold">{obtenerValor(promocion)}</p>
                </div>

                <div>
                  <p className="font-medium">Período:</p>
                  <p>{obtenerFechas(promocion)}</p>
                </div>
              </div>

              {(promocion.codigo || promocion.code) && (
                <div>
                  <p className="text-sm font-medium">Código:</p>
                  <p className="text-sm font-mono bg-muted p-1 rounded">{promocion.codigo || promocion.code}</p>
                </div>
              )}

              {(promocion.usageCount !== undefined || promocion.usageLimit !== undefined) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Usos:</span>
                  <span>
                    {promocion.usageCount || 0}
                    {promocion.usageLimit ? ` / ${promocion.usageLimit}` : ""}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/promociones/${idLimpio}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/promociones/${idLimpio}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
