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
  titulo: string
  descripcion?: string
  tipo?: string
  valor?: number | string
  fechaInicio?: string
  fechaFin?: string | null
  codigo?: string | null
  activa?: boolean
  estado?: string
  limite_uso?: number
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

      // Validar que data es un array y tiene elementos válidos
      if (Array.isArray(data)) {
        const promocionesValidas = data.filter((p) => p && typeof p === "object" && p.id)
        setPromociones(promocionesValidas)
        console.log(`✅ Promociones válidas: ${promocionesValidas.length}`)
      } else {
        console.warn("⚠️ Data no es un array:", data)
        setPromociones([])
      }
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

  // Función para obtener el valor de manera segura
  const obtenerValor = (promocion: Promocion): string => {
    const valor = promocion.valor || 0
    const tipo = promocion.tipo || "AUTOMATICO"

    if (tipo.includes("PORCENTAJE") || tipo === "percentage") {
      return `${valor}%`
    } else if (tipo.includes("CANTIDAD") || tipo === "fixed_amount") {
      return `€${valor}`
    } else if (tipo.includes("ENVIO") || tipo === "free_shipping") {
      return "Envío gratis"
    }
    return `${valor}`
  }

  // Función para obtener el estado de manera segura
  const obtenerEstado = (promocion: Promocion) => {
    if (promocion.activa === true || promocion.estado === "ACTIVE") {
      return { texto: "Activa", variant: "default" as const }
    } else if (promocion.estado === "EXPIRED") {
      return { texto: "Expirada", variant: "destructive" as const }
    } else if (promocion.estado === "SCHEDULED") {
      return { texto: "Programada", variant: "secondary" as const }
    } else {
      return { texto: "Inactiva", variant: "outline" as const }
    }
  }

  // Función para obtener las fechas de manera segura
  const obtenerFechas = (promocion: Promocion): string => {
    if (!promocion.fechaInicio) return "Sin fecha"

    try {
      const inicio = new Date(promocion.fechaInicio).toLocaleDateString()
      if (promocion.fechaFin) {
        const fin = new Date(promocion.fechaFin).toLocaleDateString()
        return `${inicio} - ${fin}`
      }
      return `Desde ${inicio}`
    } catch {
      return "Fecha inválida"
    }
  }

  // Función para generar URLs seguras para las promociones
  const getPromocionUrl = (id: string, action: "view" | "edit" = "view"): string => {
    // Extraer solo el ID numérico para evitar problemas con el formato
    const cleanId = extractShopifyId(id)
    return `/dashboard/promociones/${cleanId}${action === "edit" ? "/edit" : ""}`
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
        const estado = obtenerEstado(promocion)
        // Usar la función para generar URLs seguras
        const viewUrl = getPromocionUrl(promocion.id, "view")
        const editUrl = getPromocionUrl(promocion.id, "edit")

        return (
          <Card key={promocion.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {promocion.descripcion || "Sin descripción"}
                  </CardDescription>
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

              {promocion.codigo && (
                <div>
                  <p className="text-sm font-medium">Código:</p>
                  <p className="text-sm font-mono bg-muted p-1 rounded">{promocion.codigo}</p>
                </div>
              )}

              {promocion.limite_uso && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Límite de usos:</span>
                  <span>{promocion.limite_uso}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={viewUrl}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={editUrl}>
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
