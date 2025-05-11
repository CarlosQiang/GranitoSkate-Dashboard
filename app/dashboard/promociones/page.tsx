"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { obtenerListasPrecios, eliminarListaPrecio } from "@/lib/api/promociones"
import type { Promocion } from "@/types/promociones"
import { Plus, Search, Tag, Percent, ShoppingBag, AlertCircle, Loader2, Wand2, Truck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * Página principal de gestión de promociones
 *
 * @returns {JSX.Element} Componente de React
 */
export default function PaginaPromociones() {
  // Hooks
  const router = useRouter()
  const { toast } = useToast()

  // Estado
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [cargando, setCargando] = useState(true)
  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [pestanaActiva, setPestanaActiva] = useState("todas")
  const [error, setError] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  // Cargar promociones al montar el componente
  useEffect(() => {
    let montado = true // Para evitar actualizar estado en componentes desmontados

    async function cargarDatos() {
      try {
        setCargando(true)
        const datos = await obtenerListasPrecios()

        // Solo actualizar si el componente sigue montado
        if (montado) {
          setPromociones(datos)
          setError(null)
        }
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        if (montado) {
          setError("No se pudieron cargar las promociones. Por favor, inténtalo de nuevo.")
        }
      } finally {
        if (montado) {
          setCargando(false)
        }
      }
    }

    cargarDatos()

    // Cleanup function
    return () => {
      montado = false
    }
  }, [])

  // Función para eliminar una promoción
  const handleEliminar = async (id: string) => {
    // Confirmación antes de eliminar
    if (!confirm("¿Estás seguro de que quieres eliminar esta promoción? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setEliminando(id)
      await eliminarListaPrecio(id)

      // Actualizar estado local
      setPromociones(promociones.filter((promo) => promo.id !== id))

      // Notificar éxito
      toast({
        title: "Promoción eliminada",
        description: "La promoción ha sido eliminada correctamente.",
      })
    } catch (err) {
      console.error("Error al eliminar la promoción:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setEliminando(null)
    }
  }

  // Filtrar promociones según la pestaña activa y el término de búsqueda
  const promocionesFiltradas = useMemo(() => {
    return promociones.filter((promo) => {
      // Filtro por término de búsqueda (case insensitive)
      const coincideBusqueda = promo.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase())

      // Determinar estado de la promoción
      const ahora = new Date()
      const fechaInicio = new Date(promo.fechaInicio)
      const fechaFin = promo.fechaFin ? new Date(promo.fechaFin) : null

      const estaActiva = fechaInicio <= ahora && (!fechaFin || fechaFin >= ahora) && promo.activa
      const esProxima = fechaInicio > ahora
      const estaExpirada = fechaFin ? fechaFin < ahora : false

      // Filtrar según la pestaña seleccionada
      if (!coincideBusqueda) return false

      switch (pestanaActiva) {
        case "activas":
          return estaActiva
        case "proximas":
          return esProxima
        case "expiradas":
          return estaExpirada
        default:
          return true // "todas"
      }
    })
  }, [promociones, terminoBusqueda, pestanaActiva])

  // Función para renderizar el icono según el tipo de promoción
  const getIconoPromocion = (tipo: string) => {
    switch (tipo) {
      case "PORCENTAJE_DESCUENTO":
        return <Percent className="h-5 w-5 text-granito" />
      case "CANTIDAD_FIJA":
        return <Tag className="h-5 w-5 text-granito" />
      case "COMPRA_X_LLEVA_Y":
        return <ShoppingBag className="h-5 w-5 text-granito" />
      case "ENVIO_GRATIS":
        return <Truck className="h-5 w-5 text-granito" />
      default:
        return <Tag className="h-5 w-5 text-gray-500" />
    }
  }

  // Función para formatear el valor de la promoción
  const formatearValor = (promocion: Promocion) => {
    switch (promocion.tipo) {
      case "PORCENTAJE_DESCUENTO":
        return `${promocion.valor}% de descuento`
      case "CANTIDAD_FIJA":
        return `${promocion.valor}€ de descuento`
      case "COMPRA_X_LLEVA_Y":
        // Buscar la condición de compra mínima si existe
        const condCompra = promocion.condiciones.find((c) => c.tipo === "CANTIDAD_MINIMA")
        const cantidadCompra = condCompra ? condCompra.valor : "X"
        return `Compra ${cantidadCompra} y llévate ${promocion.valor}`
      case "ENVIO_GRATIS":
        return "Envío gratuito"
      default:
        return `${promocion.valor}`
    }
  }

  // Función para determinar el estado de la promoción
  const getEstadoPromocion = (promocion: Promocion) => {
    const ahora = new Date()
    const fechaInicio = new Date(promocion.fechaInicio)
    const fechaFin = promocion.fechaFin ? new Date(promocion.fechaFin) : null

    if (fechaInicio > ahora) {
      return { etiqueta: "Próximamente", color: "bg-granito-light/20 text-granito-dark" }
    } else if (fechaFin && fechaFin < ahora) {
      return { etiqueta: "Expirada", color: "bg-gray-100 text-gray-800" }
    } else if (!promocion.activa) {
      return { etiqueta: "Inactiva", color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { etiqueta: "Activa", color: "bg-green-100 text-green-800" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>

        {/* Menú de creación de promociones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-granito hover:bg-granito-dark">
              <Plus className="mr-2 h-4 w-4" />
              Nueva promoción
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/dashboard/promociones/asistente")}>
              <Wand2 className="mr-2 h-4 w-4 text-granito" />
              <span>Asistente de promociones</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/promociones/nueva")}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Crear manualmente</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Buscador */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar promociones..."
            className="pl-8"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Pestañas de filtrado */}
      <Tabs defaultValue="todas" value={pestanaActiva} onValueChange={setPestanaActiva}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="proximas">Próximas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value={pestanaActiva} className="mt-6">
          {/* Estado de carga */}
          {cargando ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Placeholders de carga */}
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="animate-pulse">
                  <CardHeader className="h-24 bg-gray-100"></CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : promocionesFiltradas.length === 0 ? (
            // Estado vacío
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay promociones</p>
                <p className="text-muted-foreground text-center mb-6">
                  {terminoBusqueda
                    ? "No se encontraron promociones que coincidan con tu búsqueda."
                    : "Crea tu primera promoción para atraer más clientes a tu tienda."}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push("/dashboard/promociones/asistente")}
                    className="bg-granito hover:bg-granito-dark"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Usar asistente
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard/promociones/nueva")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear manualmente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Lista de promociones
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promocionesFiltradas.map((promo) => {
                const estado = getEstadoPromocion(promo)
                return (
                  <Card key={promo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-col space-y-1">
                        <CardTitle className="line-clamp-1">{promo.titulo}</CardTitle>
                        <CardDescription>
                          {promo.objetivo === "COLECCION"
                            ? "Aplicada a una colección"
                            : promo.objetivo === "PRODUCTO"
                              ? "Aplicada a un producto"
                              : "Aplicada a toda la tienda"}
                        </CardDescription>
                      </div>
                      {getIconoPromocion(promo.tipo)}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Descuento:</span>
                          <span className="font-bold">{formatearValor(promo)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Periodo:</span>
                          <span className="text-sm">
                            {format(new Date(promo.fechaInicio), "dd MMM", { locale: es })} -{" "}
                            {promo.fechaFin ? format(new Date(promo.fechaFin), "dd MMM", { locale: es }) : "Sin fin"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Estado:</span>
                          <Badge variant="outline" className={estado.color}>
                            {estado.etiqueta}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/promociones/${promo.id}`)}
                          >
                            Ver detalles
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleEliminar(promo.id)}
                            disabled={eliminando === promo.id}
                          >
                            {eliminando === promo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
