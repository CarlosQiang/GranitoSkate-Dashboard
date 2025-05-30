"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PromocionesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [promociones, setPromociones] = useState([])

  useEffect(() => {
    // Simulamos carga de datos
    setTimeout(() => {
      setIsLoading(false)
      // Datos de ejemplo
      setPromociones([
        {
          id: "2054072041736",
          titulo: "Promoción 10% de descuento",
          codigo: "PROMO10",
          valor: 10,
          tipo: "porcentaje",
          activo: true,
          fecha_inicio: "2025-05-30",
        },
      ])
    }, 1000)
  }, [])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/promociones/asistente">
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>
        <TabsContent value="todas" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Cargando promociones...</p>
            </div>
          ) : promociones.length > 0 ? (
            <div className="grid gap-4">
              {promociones.map((promo) => (
                <Card key={promo.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{promo.titulo}</CardTitle>
                    <CardDescription>
                      {promo.tipo === "porcentaje" ? `${promo.valor}% de descuento` : `${promo.valor}€ de descuento`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Desde {promo.fecha_inicio}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${promo.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {promo.activo ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/promociones/${promo.id}`}>Ver detalles</Link>
                      </Button>
                      <Button variant="destructive" size="sm">
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p>No hay promociones disponibles</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="activas">
          <div className="flex justify-center items-center h-40">
            <p>Promociones activas</p>
          </div>
        </TabsContent>
        <TabsContent value="programadas">
          <div className="flex justify-center items-center h-40">
            <p>Promociones programadas</p>
          </div>
        </TabsContent>
        <TabsContent value="expiradas">
          <div className="flex justify-center items-center h-40">
            <p>Promociones expiradas</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Aquí iría el componente de sincronización, pero lo comentamos por ahora */}
      {/* <div className="mt-8">
        <SyncPromotionsOnly onSyncComplete={() => {}} />
      </div> */}
    </div>
  )
}
