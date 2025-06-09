"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, RefreshCw, Gift, Calendar, Percent, Euro } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { fetchPromociones } from "@/lib/api/promociones"
import { ResponsivePageContainer } from "@/components/responsive-page-container"
import Link from "next/link"

interface Promocion {
  id: string
  shopify_id?: string
  titulo: string
  descripcion?: string
  tipo: string
  valor: number
  codigo?: string | null
  fechaInicio: string
  fechaFin?: string | null
  activa: boolean
  estado?: string
  esShopify?: boolean
}

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroActivo, setFiltroActivo] = useState("todas")

  const cargarPromociones = async (filtro = "todas") => {
    try {
      setIsLoading(true)
      setError(null)
      console.log(`🔄 Cargando promociones con filtro: ${filtro}`)

      const data = await fetchPromociones(filtro)
      console.log(`✅ Promociones cargadas:`, data)

      setPromociones(data || [])

      if (data && data.length > 0) {
        toast({
          title: "Promociones cargadas",
          description: `Se cargaron ${data.length} promociones correctamente.`,
        })
      }
    } catch (error) {
      console.error("❌ Error cargando promociones:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setPromociones([])

      toast({
        title: "Error al cargar promociones",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarPromociones(filtroActivo)
  }, [filtroActivo])

  const handleRefresh = () => {
    cargarPromociones(filtroActivo)
  }

  const getEstadoBadge = (promocion: Promocion) => {
    if (promocion.activa) {
      return (
        <Badge variant="default" className="bg-green-500">
          Activa
        </Badge>
      )
    }

    const now = new Date()
    const fechaInicio = new Date(promocion.fechaInicio)
    const fechaFin = promocion.fechaFin ? new Date(promocion.fechaFin) : null

    if (fechaInicio > now) {
      return <Badge variant="secondary">Programada</Badge>
    }

    if (fechaFin && fechaFin < now) {
      return <Badge variant="outline">Expirada</Badge>
    }

    return <Badge variant="outline">Inactiva</Badge>
  }

  const getValorFormateado = (promocion: Promocion) => {
    if (promocion.tipo === "PERCENTAGE_DISCOUNT" || promocion.tipo === "PORCENTAJE_DESCUENTO") {
      return `${promocion.valor}%`
    }
    return `€${promocion.valor}`
  }

  const getIconoTipo = (promocion: Promocion) => {
    if (promocion.tipo === "PERCENTAGE_DISCOUNT" || promocion.tipo === "PORCENTAJE_DESCUENTO") {
      return <Percent className="h-4 w-4" />
    }
    return <Euro className="h-4 w-4" />
  }

  const promocionesFiltradas = promociones.filter((promocion) => {
    if (filtroActivo === "todas") return true

    const now = new Date()
    const fechaInicio = new Date(promocion.fechaInicio)
    const fechaFin = promocion.fechaFin ? new Date(promocion.fechaFin) : null

    switch (filtroActivo) {
      case "activas":
        return promocion.activa
      case "programadas":
        return fechaInicio > now
      case "expiradas":
        return fechaFin && fechaFin < now
      default:
        return true
    }
  })

  return (
    <ResponsivePageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promociones</h1>
            <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Link href="/dashboard/promociones/asistente">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva promoción
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs para filtros */}
        <Tabs value={filtroActivo} onValueChange={setFiltroActivo} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="activas">Activas</TabsTrigger>
            <TabsTrigger value="programadas">Programadas</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
          </TabsList>

          <TabsContent value={filtroActivo} className="space-y-4">
            {/* Estado de carga */}
            {isLoading && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <Gift className="h-5 w-5" />
                    <span className="font-medium">Error al cargar promociones</span>
                  </div>
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                  <Button onClick={handleRefresh} variant="outline" className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Sin promociones */}
            {!isLoading && !error && promocionesFiltradas.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Gift className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium">No hay promociones</h3>
                      <p className="text-muted-foreground">
                        {filtroActivo === "todas"
                          ? "No hay promociones creadas."
                          : `No hay promociones ${filtroActivo}.`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Recargar
                      </Button>
                      <Link href="/dashboard/promociones/asistente">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear promoción
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de promociones */}
            {!isLoading && !error && promocionesFiltradas.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {promocionesFiltradas.map((promocion) => (
                  <Card key={promocion.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-1">{promocion.titulo}</CardTitle>
                        {getEstadoBadge(promocion)}
                      </div>
                      {promocion.descripcion && (
                        <CardDescription className="line-clamp-2">{promocion.descripcion}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Valor del descuento */}
                      <div className="flex items-center gap-2">
                        {getIconoTipo(promocion)}
                        <span className="font-semibold text-lg">{getValorFormateado(promocion)}</span>
                        <span className="text-sm text-muted-foreground">descuento</span>
                      </div>

                      {/* Código si existe */}
                      {promocion.codigo && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {promocion.codigo}
                          </Badge>
                        </div>
                      )}

                      {/* Fechas */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Inicio: {new Date(promocion.fechaInicio).toLocaleDateString()}</span>
                        </div>
                        {promocion.fechaFin && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Fin: {new Date(promocion.fechaFin).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Origen */}
                      {promocion.esShopify && (
                        <Badge variant="secondary" className="text-xs">
                          Shopify
                        </Badge>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/dashboard/promociones/${promocion.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Ver detalles
                          </Button>
                        </Link>
                        <Link href={`/dashboard/promociones/${promocion.id}/edit`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsivePageContainer>
  )
}
