"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, PlusCircle, TagIcon, AlertCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { obtenerPromociones } from "@/lib/api/promociones" // Cambiado de fetchPromociones a obtenerPromociones

export default function PromocionesPage() {
  const router = useRouter()
  const [promociones, setPromociones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPromociones = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await obtenerPromociones() // Cambiado de fetchPromociones a obtenerPromociones
      console.log("Promociones cargadas:", data)
      setPromociones(data)
    } catch (err) {
      console.error("Error al cargar promociones:", err)
      setError(`Error al cargar promociones: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarPromociones()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activa":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "expirada":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "programada":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "activa":
        return "Activa"
      case "expirada":
        return "Expirada"
      case "programada":
        return "Programada"
      default:
        return "Desconocido"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleEliminarPromocion = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta promoción?")) {
      try {
        const response = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Recargar promociones después de eliminar
          cargarPromociones()
        } else {
          const errorData = await response.json()
          setError(`Error al eliminar promoción: ${errorData.error || response.statusText}`)
        }
      } catch (err) {
        console.error("Error al eliminar promoción:", err)
        setError(`Error al eliminar promoción: ${(err as Error).message}`)
      }
    }
  }

  // Función para extraer el ID numérico de un gid de Shopify
  const extractNumericId = (id: string) => {
    if (id.includes("gid:")) {
      const matches = id.match(/\/(\d+)$/)
      if (matches && matches[1]) {
        return matches[1]
      }
    }
    return id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/promociones/asistente")}
          className="bg-granito hover:bg-granito/90 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva promoción
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="w-fit" onClick={cargarPromociones}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : promociones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promociones.map((promocion) => (
                <Card key={promocion.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                      <Badge className={getStatusColor(promocion.estado)}>{getStatusText(promocion.estado)}</Badge>
                    </div>
                    <CardDescription>
                      {promocion.tipo === "PORCENTAJE_DESCUENTO"
                        ? `${promocion.valor}% de descuento`
                        : promocion.tipo === "CANTIDAD_FIJA"
                          ? `${promocion.valor}€ de descuento`
                          : promocion.tipo === "ENVIO_GRATIS"
                            ? "Envío gratis"
                            : "Compra X y lleva Y"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>
                        Desde {formatDate(promocion.fechaInicio)}
                        {promocion.fechaFin ? ` hasta ${formatDate(promocion.fechaFin)}` : ""}
                      </span>
                    </div>
                    {promocion.codigo && (
                      <div className="flex items-center text-sm">
                        <TagIcon className="mr-1 h-4 w-4" />
                        <span>
                          Código: <strong>{promocion.codigo}</strong>
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/promociones/${extractNumericId(promocion.id)}`)}
                    >
                      Ver detalles
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleEliminarPromocion(promocion.id)}
                    >
                      Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-muted p-3">
                  <TagIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No hay promociones</h3>
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                  Crea tu primera promoción para atraer más clientes a tu tienda.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/promociones/asistente")}
                  className="bg-granito hover:bg-granito/90 text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva promoción
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activas" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promociones
                .filter((p) => p.estado === "activa")
                .map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Activa</Badge>
                      </div>
                      <CardDescription>
                        {promocion.tipo === "PORCENTAJE_DESCUENTO"
                          ? `${promocion.valor}% de descuento`
                          : promocion.tipo === "CANTIDAD_FIJA"
                            ? `${promocion.valor}€ de descuento`
                            : promocion.tipo === "ENVIO_GRATIS"
                              ? "Envío gratis"
                              : "Compra X y lleva Y"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>
                          Desde {formatDate(promocion.fechaInicio)}
                          {promocion.fechaFin ? ` hasta ${formatDate(promocion.fechaFin)}` : ""}
                        </span>
                      </div>
                      {promocion.codigo && (
                        <div className="flex items-center text-sm">
                          <TagIcon className="mr-1 h-4 w-4" />
                          <span>
                            Código: <strong>{promocion.codigo}</strong>
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/promociones/${extractNumericId(promocion.id)}`)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleEliminarPromocion(promocion.id)}
                      >
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              {promociones.filter((p) => p.estado === "activa").length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-muted p-3">
                      <TagIcon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No hay promociones activas</h3>
                    <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                      Crea una nueva promoción o activa una existente.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/promociones/asistente")}
                      className="bg-granito hover:bg-granito/90 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nueva promoción
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programadas" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promociones
                .filter((p) => p.estado === "programada")
                .map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Programada</Badge>
                      </div>
                      <CardDescription>
                        {promocion.tipo === "PORCENTAJE_DESCUENTO"
                          ? `${promocion.valor}% de descuento`
                          : promocion.tipo === "CANTIDAD_FIJA"
                            ? `${promocion.valor}€ de descuento`
                            : promocion.tipo === "ENVIO_GRATIS"
                              ? "Envío gratis"
                              : "Compra X y lleva Y"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>
                          Desde {formatDate(promocion.fechaInicio)}
                          {promocion.fechaFin ? ` hasta ${formatDate(promocion.fechaFin)}` : ""}
                        </span>
                      </div>
                      {promocion.codigo && (
                        <div className="flex items-center text-sm">
                          <TagIcon className="mr-1 h-4 w-4" />
                          <span>
                            Código: <strong>{promocion.codigo}</strong>
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/promociones/${extractNumericId(promocion.id)}`)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleEliminarPromocion(promocion.id)}
                      >
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              {promociones.filter((p) => p.estado === "programada").length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-muted p-3">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No hay promociones programadas</h3>
                    <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                      Programa promociones para fechas futuras.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/promociones/asistente")}
                      className="bg-granito hover:bg-granito/90 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nueva promoción
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expiradas" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promociones
                .filter((p) => p.estado === "expirada")
                .map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{promocion.titulo}</CardTitle>
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Expirada</Badge>
                      </div>
                      <CardDescription>
                        {promocion.tipo === "PORCENTAJE_DESCUENTO"
                          ? `${promocion.valor}% de descuento`
                          : promocion.tipo === "CANTIDAD_FIJA"
                            ? `${promocion.valor}€ de descuento`
                            : promocion.tipo === "ENVIO_GRATIS"
                              ? "Envío gratis"
                              : "Compra X y lleva Y"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>
                          Desde {formatDate(promocion.fechaInicio)}
                          {promocion.fechaFin ? ` hasta ${formatDate(promocion.fechaFin)}` : ""}
                        </span>
                      </div>
                      {promocion.codigo && (
                        <div className="flex items-center text-sm">
                          <TagIcon className="mr-1 h-4 w-4" />
                          <span>
                            Código: <strong>{promocion.codigo}</strong>
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/promociones/${extractNumericId(promocion.id)}`)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleEliminarPromocion(promocion.id)}
                      >
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              {promociones.filter((p) => p.estado === "expirada").length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-muted p-3">
                      <TagIcon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No hay promociones expiradas</h3>
                    <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                      Las promociones expiradas aparecerán aquí.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/promociones/asistente")}
                      className="bg-granito hover:bg-granito/90 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nueva promoción
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
