"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { fetchPromociones } from "@/lib/api/promociones"
import LoadingState from "@/components/loading-state"

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const cargarPromociones = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPromociones()
      setPromociones(data)
    } catch (error) {
      console.error("Error al cargar promociones:", error)
      setError(error.message || "Error al cargar promociones")
      toast({
        variant: "destructive",
        title: "Error al cargar promociones",
        description: error.message || "Ha ocurrido un error al cargar las promociones",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPromociones()
  }, [])

  // Filtrar promociones por estado
  const promocionesActivas = promociones.filter(
    (promo) => promo.active && (!promo.endDate || new Date(promo.endDate) > new Date()),
  )
  const promocionesProgramadas = promociones.filter((promo) => !promo.active && new Date(promo.startDate) > new Date())
  const promocionesExpiradas = promociones.filter(
    (promo) => !promo.active || (promo.endDate && new Date(promo.endDate) <= new Date()),
  )

  const renderPromocionesCards = (items) => {
    if (items.length === 0) {
      return (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center">No hay promociones en esta categoría</p>
          </CardContent>
        </Card>
      )
    }

    return items.map((promocion) => (
      <Card key={promocion.id} className="overflow-hidden">
        <CardHeader className="bg-muted/50 pb-2">
          <CardTitle className="text-lg font-medium">{promocion.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {promocion.isAutomatic ? "Automática" : `Código: ${promocion.code}`}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tipo:</span>
              <span className="text-sm">
                {promocion.type === "PERCENTAGE_DISCOUNT"
                  ? `${promocion.value}% de descuento`
                  : promocion.type === "FIXED_AMOUNT_DISCOUNT"
                    ? `${promocion.value}€ de descuento`
                    : promocion.type === "BUY_X_GET_Y"
                      ? `Compra ${promocion.value}, lleva gratis`
                      : "Envío gratis"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Estado:</span>
              <span className="text-sm">
                {promocion.active ? "Activa" : new Date(promocion.startDate) > new Date() ? "Programada" : "Expirada"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fecha inicio:</span>
              <span className="text-sm">{new Date(promocion.startDate).toLocaleDateString()}</span>
            </div>
            {promocion.endDate && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Fecha fin:</span>
                <span className="text-sm">{new Date(promocion.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Link href={`/dashboard/promociones/${promocion.id}`}>
              <Button variant="outline" size="sm">
                Ver detalles
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    ))
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promociones</h1>
        <div className="flex gap-2">
          {error && (
            <Button variant="outline" onClick={cargarPromociones} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
          <Link href="/dashboard/promociones/asistente">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva promoción
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>

      {loading ? (
        <LoadingState message="Cargando promociones..." />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar promociones</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todas">Todas ({promociones.length})</TabsTrigger>
            <TabsTrigger value="activas">Activas ({promocionesActivas.length})</TabsTrigger>
            <TabsTrigger value="programadas">Programadas ({promocionesProgramadas.length})</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas ({promocionesExpiradas.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="todas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderPromocionesCards(promociones)}
            </div>
          </TabsContent>
          <TabsContent value="activas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderPromocionesCards(promocionesActivas)}
            </div>
          </TabsContent>
          <TabsContent value="programadas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderPromocionesCards(promocionesProgramadas)}
            </div>
          </TabsContent>
          <TabsContent value="expiradas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderPromocionesCards(promocionesExpiradas)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
