"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchPromociones } from "@/lib/api/promociones"
import { Loader2, Plus, Eye, Edit } from "lucide-react"
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

export function PromocionesListClient() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState("todas")

  const cargarPromociones = async (filtroActual = "todas") => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔍 Cargando promociones con filtro: ${filtroActual}`)

      const data = await fetchPromociones(filtroActual)
      console.log(`✅ Promociones cargadas:`, data)

      setPromociones(data || [])
    } catch (err) {
      console.error("❌ Error al cargar promociones:", err)
      setError("Error al cargar promociones. Intente nuevamente.")
      setPromociones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPromociones(filtro)
  }, [filtro])

  // Función para obtener el título de manera segura
  const obtenerTitulo = (promocion: Promocion): string => {
    return promocion.titulo || promocion.title || "Sin título"
  }

  // Función para obtener la descripción de manera segura
  const obtenerDescripcion = (promocion: Promocion): string => {
    return promocion.descripcion || promocion.description || "Sin descripción"
  }

  // Función para obtener el valor de manera segura
  const obtenerValor = (promocion: Promocion): string => {
    const valor = promocion.valor || promocion.value || 0
    const tipo = promocion.tipo || promocion.valueType || "PERCENTAGE_DISCOUNT"

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
    if (promocion.activa === true || promocion.status === "active") {
      return { texto: "Activa", variant: "default" }
    } else if (promocion.status === "expired") {
      return { texto: "Expirada", variant: "destructive" }
    } else if (promocion.status === "scheduled") {
      return { texto: "Programada", variant: "secondary" }
    } else {
      return { texto: "Inactiva", variant: "outline" }
    }
  }

  // Función para obtener las fechas de manera segura
  const obtenerFechas = (promocion: Promocion): string => {
    const fechaInicio = promocion.fechaInicio || promocion.startsAt
    const fechaFin = promocion.fechaFin || promocion.endsAt

    if (!fechaInicio) return "Sin fecha"

    const inicio = new Date(fechaInicio).toLocaleDateString()
    if (fechaFin) {
      const fin = new Date(fechaFin).toLocaleDateString()
      return `${inicio} - ${fin}`
    }
    return `Desde ${inicio}`
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
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => cargarPromociones(filtro)}>Intentar de nuevo</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar promociones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las promociones</SelectItem>
              <SelectItem value="activas">Activas</SelectItem>
              <SelectItem value="programadas">Programadas</SelectItem>
              <SelectItem value="expiradas">Expiradas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/dashboard/promociones/asistente">
          <Button className="bg-granito hover:bg-granito/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva promoción
          </Button>
        </Link>
      </div>

      {promociones.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">No hay promociones disponibles</p>
          <Link href="/dashboard/promociones/asistente">
            <Button className="bg-granito hover:bg-granito/90">
              <Plus className="h-4 w-4 mr-2" />
              Crear primera promoción
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promociones.map((promocion) => {
            const estado = obtenerEstado(promocion)

            return (
              <Card key={promocion.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{obtenerTitulo(promocion)}</CardTitle>
                    <Badge variant={estado.variant}>{estado.texto}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{obtenerDescripcion(promocion)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Descuento:</span>
                    <span className="font-semibold text-granito">{obtenerValor(promocion)}</span>
                  </div>

                  {(promocion.codigo || promocion.code) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Código:</span>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{promocion.codigo || promocion.code}</code>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <span className="text-sm">{obtenerFechas(promocion)}</span>
                  </div>

                  {(promocion.usageCount !== undefined || promocion.usageLimit !== undefined) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usos:</span>
                      <span className="text-sm">
                        {promocion.usageCount || 0}
                        {promocion.usageLimit ? ` / ${promocion.usageLimit}` : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/promociones/${promocion.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/dashboard/promociones/${promocion.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
