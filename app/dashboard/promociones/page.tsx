"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, PlusIcon, TagIcon, AlertCircle } from "lucide-react"
import { fetchPromotions } from "@/lib/api/promociones"
import { formatDate } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const cargarPromociones = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPromotions()
        setPromociones(data)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError(err.message || "Error al cargar promociones")
      } finally {
        setLoading(false)
      }
    }

    cargarPromociones()
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Activa</Badge>
      case "EXPIRED":
        return (
          <Badge variant="outline" className="text-gray-500">
            Expirada
          </Badge>
        )
      case "SCHEDULED":
        return <Badge className="bg-blue-500">Programada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getTipoValorText = (tipoValor, valor) => {
    return tipoValor === "percentage" ? `${valor}%` : `${valor}€`
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promociones</h1>
        <Button
          onClick={() => router.push("/dashboard/promociones/asistente")}
          className="bg-granito hover:bg-granito/90"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Nueva Promoción
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="link" onClick={handleRetry} className="ml-2 p-0">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="todas">
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : promociones.length > 0 ? (
              promociones.map((promocion) => (
                <Card key={promocion.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{promocion.titulo}</CardTitle>
                      {getEstadoBadge(promocion.estado)}
                    </div>
                    <CardDescription>
                      {promocion.codigo && (
                        <span className="flex items-center text-sm font-medium">
                          <TagIcon className="mr-1 h-3 w-3" /> Código: {promocion.codigo}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold mb-2">
                      {getTipoValorText(promocion.tipoValor, promocion.valor)} de descuento
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {formatDate(promocion.fechaInicio)}
                      {promocion.fechaFin && ` - ${formatDate(promocion.fechaFin)}`}
                    </p>
                    {promocion.resumen && <p className="mt-2 text-sm">{promocion.resumen}</p>}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/promociones/${promocion.id}`)}
                    >
                      Ver detalles
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">No hay promociones disponibles</p>
                <Button
                  onClick={() => router.push("/dashboard/promociones/asistente")}
                  className="bg-granito hover:bg-granito/90"
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Crear primera promoción
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : promociones.filter((p) => p.estado === "ACTIVE").length > 0 ? (
              promociones
                .filter((p) => p.estado === "ACTIVE")
                .map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{promocion.titulo}</CardTitle>
                        {getEstadoBadge(promocion.estado)}
                      </div>
                      <CardDescription>
                        {promocion.codigo && (
                          <span className="flex items-center text-sm font-medium">
                            <TagIcon className="mr-1 h-3 w-3" /> Código: {promocion.codigo}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-bold mb-2">
                        {getTipoValorText(promocion.tipoValor, promocion.valor)} de descuento
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatDate(promocion.fechaInicio)}
                        {promocion.fechaFin && ` - ${formatDate(promocion.fechaFin)}`}
                      </p>
                      {promocion.resumen && <p className="mt-2 text-sm">{promocion.resumen}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/promociones/${promocion.id}`)}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hay promociones activas</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="programadas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : promociones.filter((p) => p.estado === "SCHEDULED").length > 0 ? (
              promociones
                .filter((p) => p.estado === "SCHEDULED")
                .map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{promocion.titulo}</CardTitle>
                        {getEstadoBadge(promocion.estado)}
                      </div>
                      <CardDescription>
                        {promocion.codigo && (
                          <span className="flex items-center text-sm font-medium">
                            <TagIcon className="mr-1 h-3 w-3" /> Código: {promocion.codigo}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-bold mb-2">
                        {getTipoValorText(promocion.tipoValor, promocion.valor)} de descuento
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatDate(promocion.fechaInicio)}
                        {promocion.fechaFin && ` - ${formatDate(promocion.fechaFin)}`}
                      </p>
                      {promocion.resumen && <p className="mt-2 text-sm">{promocion.resumen}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/promociones/${promocion.id}`)}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hay promociones programadas</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="expiradas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : promociones.filter((p) => p.estado === "EXPIRED").length > 0 ? (
              promociones
                .filter((p) => p.estado === "EXPIRED")
                .map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{promocion.titulo}</CardTitle>
                        {getEstadoBadge(promocion.estado)}
                      </div>
                      <CardDescription>
                        {promocion.codigo && (
                          <span className="flex items-center text-sm font-medium">
                            <TagIcon className="mr-1 h-3 w-3" /> Código: {promocion.codigo}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-bold mb-2">
                        {getTipoValorText(promocion.tipoValor, promocion.valor)} de descuento
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatDate(promocion.fechaInicio)}
                        {promocion.fechaFin && ` - ${formatDate(promocion.fechaFin)}`}
                      </p>
                      {promocion.resumen && <p className="mt-2 text-sm">{promocion.resumen}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/promociones/${promocion.id}`)}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hay promociones expiradas</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
