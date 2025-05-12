"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { fetchPromociones } from "@/lib/api/promociones"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Tag, AlertCircle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PromocionesPage() {
  const router = useRouter()
  const [promociones, setPromociones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("todas")

  useEffect(() => {
    async function cargarPromociones() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchPromociones()
        setPromociones(data)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError(`Error al cargar promociones: ${(err as Error).message}`)
      } finally {
        setIsLoading(false)
      }
    }

    cargarPromociones()
  }, [])

  // Filtrar promociones según la pestaña activa
  const filteredPromociones = promociones.filter((promocion) => {
    if (activeTab === "todas") return true
    if (activeTab === "activas") return promocion.estado === "activa"
    if (activeTab === "programadas") {
      const fechaInicio = new Date(promocion.fechaInicio)
      return fechaInicio > new Date()
    }
    if (activeTab === "expiradas") {
      const fechaFin = promocion.fechaFin ? new Date(promocion.fechaFin) : null
      return fechaFin && fechaFin < new Date()
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
        <Button onClick={() => router.push("/dashboard/promociones/asistente")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva promoción
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestiona las promociones y descuentos de tu tienda</CardTitle>
          <CardDescription>
            Crea y administra promociones para aumentar las ventas y fidelizar a tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="activas">Activas</TabsTrigger>
              <TabsTrigger value="programadas">Programadas</TabsTrigger>
              <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                </Alert>
              ) : filteredPromociones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay promociones</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {activeTab === "todas"
                      ? "No hay promociones creadas. Crea tu primera promoción para aumentar tus ventas."
                      : activeTab === "activas"
                        ? "No hay promociones activas actualmente."
                        : activeTab === "programadas"
                          ? "No hay promociones programadas para el futuro."
                          : "No hay promociones expiradas."}
                  </p>
                  <Button onClick={() => router.push("/dashboard/promociones/asistente")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva promoción
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPromociones.map((promocion) => (
                    <Card key={promocion.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{promocion.titulo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {promocion.tipo === "PORCENTAJE_DESCUENTO"
                                ? `${promocion.valor}% de descuento`
                                : `${promocion.valor}€ de descuento`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Desde {format(new Date(promocion.fechaInicio), "dd MMM yyyy", { locale: es })}
                                {promocion.fechaFin
                                  ? ` hasta ${format(new Date(promocion.fechaFin), "dd MMM yyyy", { locale: es })}`
                                  : ""}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  promocion.estado === "activa"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {promocion.estado === "activa" ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/promociones/${promocion.id}`)}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
