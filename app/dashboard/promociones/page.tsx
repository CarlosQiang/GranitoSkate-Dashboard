"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Tag, Calendar, Percent, AlertCircle, PlusCircle } from "lucide-react"
import { fetchPromotions, deletePromotion } from "@/lib/api/promociones"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function cargarPromociones() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchPromotions()
        setPromociones(data)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError("No se pudieron cargar las promociones. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    cargarPromociones()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta promoción?")) {
      try {
        setIsDeleting(true)
        await deletePromotion(id)
        setPromociones((prev) => prev.filter((promo) => promo.id !== id))
      } catch (err) {
        console.error("Error al eliminar promoción:", err)
        alert("No se pudo eliminar la promoción. Por favor, inténtalo de nuevo.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const filteredPromociones = promociones.filter((promo) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.code && promo.code.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtrar por estado
    const now = new Date()
    const hasStarted = !promo.startsAt || new Date(promo.startsAt) <= now
    const hasEnded = promo.endsAt && new Date(promo.endsAt) < now
    const isActive = promo.status === "ACTIVE" && hasStarted && !hasEnded

    if (activeTab === "todas") return matchesSearch
    if (activeTab === "activas") return matchesSearch && isActive
    if (activeTab === "proximas") return matchesSearch && !hasStarted
    if (activeTab === "expiradas") return matchesSearch && hasEnded

    return matchesSearch
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promociones</h1>
        <Link href="/dashboard/promociones/asistente">
          <Button className="bg-granito hover:bg-granito/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva promoción
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar promociones..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="todas" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="proximas">Próximas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-granito mb-4" />
              <p className="text-muted-foreground">Cargando promociones...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </Alert>
          ) : filteredPromociones.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No hay promociones</h2>
              <p className="text-muted-foreground mb-6">
                Crea tu primera promoción para atraer más clientes a tu tienda.
              </p>
              <Link href="/dashboard/promociones/asistente">
                <Button className="bg-granito hover:bg-granito/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva promoción
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromociones.map((promo) => {
                // Determinar el estado de la promoción
                const now = new Date()
                const hasStarted = !promo.startsAt || new Date(promo.startsAt) <= now
                const hasEnded = promo.endsAt && new Date(promo.endsAt) < now
                const isActive = promo.status === "ACTIVE" && hasStarted && !hasEnded

                return (
                  <Card key={promo.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold">{promo.title}</CardTitle>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Activa" : hasEnded ? "Expirada" : "Próxima"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        {promo.code && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{promo.code}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {promo.valueType === "percentage"
                              ? `${promo.value}% de descuento`
                              : `${promo.value}€ de descuento`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {promo.startsAt ? `Desde ${formatDate(promo.startsAt)}` : "Sin fecha de inicio"}
                            {promo.endsAt ? ` hasta ${formatDate(promo.endsAt)}` : ""}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Link href={`/dashboard/promociones/${promo.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(promo.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
                      </Button>
                    </CardFooter>
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
