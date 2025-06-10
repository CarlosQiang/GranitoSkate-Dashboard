"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, RefreshCw, Plus, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PromocionesListClientProps {
  filter?: string
}

export function PromocionesListClient({ filter = "todas" }: PromocionesListClientProps) {
  const [promociones, setPromociones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPromociones = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔍 Cargando promociones REALES de Shopify con filtro: ${filter}`)

      // Obtener datos directamente del endpoint del Dashboard que SÍ funciona
      const response = await fetch("/api/dashboard/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const dashboardData = await response.json()
      console.log(`✅ Dashboard data obtenido:`, dashboardData)

      // Extraer promociones REALES del dashboard
      const promocionesData = dashboardData.allPromotions || []
      console.log(`✅ Promociones REALES extraídas del dashboard: ${promocionesData.length}`)
      console.log(`📋 Promociones:`, promocionesData)

      // Aplicar filtros
      let filteredPromociones = promocionesData
      if (filter === "activas") {
        filteredPromociones = promocionesData.filter((p: any) => p.status === "ACTIVE")
      } else if (filter === "programadas") {
        filteredPromociones = promocionesData.filter((p: any) => p.status === "SCHEDULED")
      } else if (filter === "expiradas") {
        filteredPromociones = promocionesData.filter((p: any) => p.status === "EXPIRED")
      }

      console.log(`✅ Promociones filtradas (${filter}): ${filteredPromociones.length}`)
      setPromociones(filteredPromociones)
    } catch (err) {
      console.error("❌ Error al cargar promociones:", err)
      setError("No se pudieron cargar las promociones. Intente nuevamente más tarde.")
      setPromociones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPromociones()
  }, [filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando promociones de Shopify...</span>
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
                  ? "No hay promociones en tu tienda de Shopify."
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
                Recargar desde Shopify
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
        // Extraer ID limpio para las rutas
        const idLimpio = promocion.id.split("/").pop() || promocion.id

        // Determinar el estado con colores apropiados
        const getEstadoBadge = (status: string) => {
          switch (status) {
            case "ACTIVE":
              return { variant: "default" as const, text: "Activa" }
            case "SCHEDULED":
              return { variant: "secondary" as const, text: "Programada" }
            case "EXPIRED":
              return { variant: "destructive" as const, text: "Expirada" }
            default:
              return { variant: "outline" as const, text: "Inactiva" }
          }
        }

        const estadoBadge = getEstadoBadge(promocion.status)

        return (
          <Card key={promocion.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{promocion.title}</CardTitle>
                <Badge variant={estadoBadge.variant}>{estadoBadge.text}</Badge>
              </div>
              <CardDescription className="line-clamp-2">{promocion.title || "Promoción de Shopify"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Descuento:</p>
                  <p className="text-granito font-semibold">
                    {promocion.type === "PERCENTAGE"
                      ? `${promocion.value}%`
                      : promocion.type === "FIXED_AMOUNT"
                        ? `€${promocion.value}`
                        : `${promocion.value}`}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Tipo:</p>
                  <p>
                    {promocion.type === "PERCENTAGE"
                      ? "Porcentaje"
                      : promocion.type === "FIXED_AMOUNT"
                        ? "Cantidad fija"
                        : "Descuento"}
                  </p>
                </div>
              </div>

              {promocion.code && (
                <div>
                  <p className="text-sm font-medium">Código:</p>
                  <p className="text-sm font-mono bg-muted p-1 rounded">{promocion.code}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Creada:</span>
                <span>{new Date(promocion.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/promociones/${idLimpio}`}>
                    <Edit className="h-4 w-4 mr-1" />
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
