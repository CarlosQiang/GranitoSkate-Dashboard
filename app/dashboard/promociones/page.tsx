"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, AlertTriangle, RefreshCw } from "lucide-react"
import { fetchPromociones } from "@/lib/api/promociones"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("todas")

  useEffect(() => {
    async function loadPromociones() {
      try {
        setIsLoading(true)
        const data = await fetchPromociones()
        setPromociones(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromociones()
  }, [])

  // Filtrar promociones según la pestaña activa
  const filteredPromociones = promociones.filter((promocion) => {
    if (activeTab === "todas") return true
    if (activeTab === "activas") return promocion.estado === "activa"
    if (activeTab === "programadas") {
      const startDate = new Date(promocion.fechaInicio)
      return startDate > new Date()
    }
    if (activeTab === "expiradas") {
      if (!promocion.fechaFin) return false
      const endDate = new Date(promocion.fechaFin)
      return endDate < new Date()
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
            <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Button>
        </div>

        <Tabs defaultValue="todas">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="activas">Activas</TabsTrigger>
            <TabsTrigger value="programadas">Programadas</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
          </TabsList>
          <TabsContent value="todas" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
            <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/promociones/asistente">
              <Plus className="mr-2 h-4 w-4" />
              Nueva promoción
            </Link>
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las promociones: {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/promociones/asistente">
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="todas" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPromociones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">
                  No hay promociones {activeTab !== "todas" ? `${activeTab}` : ""}
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  {activeTab === "todas"
                    ? "No se encontraron promociones. Crea una nueva promoción para empezar."
                    : activeTab === "activas"
                      ? "No hay promociones activas actualmente."
                      : activeTab === "programadas"
                        ? "No hay promociones programadas para el futuro."
                        : "No hay promociones expiradas."}
                </p>
                <Button asChild>
                  <Link href="/dashboard/promociones/asistente">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva promoción
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPromociones.map((promocion) => (
              <Card key={promocion.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{promocion.titulo}</h3>
                      <p className="text-muted-foreground">
                        {promocion.tipo === "PORCENTAJE_DESCUENTO"
                          ? `${promocion.valor}% de descuento`
                          : promocion.tipo === "CANTIDAD_FIJA"
                            ? `${promocion.valor}€ de descuento`
                            : promocion.tipo === "ENVIO_GRATIS"
                              ? "Envío gratis"
                              : "Descuento"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Desde {format(new Date(promocion.fechaInicio), "dd MMM yyyy", { locale: es })}
                          {promocion.fechaFin
                            ? ` hasta ${format(new Date(promocion.fechaFin), "dd MMM yyyy", { locale: es })}`
                            : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge
                        variant="outline"
                        className={
                          promocion.estado === "activa" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {promocion.estado === "activa" ? "Activa" : "Inactiva"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/promociones/${promocion.id.split("/").pop()}`}>Ver detalles</Link>
                        </Button>
                        <Button variant="outline" className="text-destructive hover:text-destructive">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
