"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Tag, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { fetchPromotions } from "@/lib/api/promotions"
import { LoadingState } from "@/components/loading-state"
import { formatDate } from "@/lib/utils"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todas")

  const loadPromotions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPromotions()
      setPromotions(data)
    } catch (err) {
      console.error("Error al cargar promociones:", err)
      setError(err.message || "No se pudieron cargar las promociones. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const filteredPromotions = promotions
    .filter((promo) => {
      // Filtrar por término de búsqueda
      if (searchTerm && !promo.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filtrar por estado según la pestaña activa
      if (activeTab === "activas" && promo.status !== "ACTIVE") {
        return false
      } else if (activeTab === "próximas" && (promo.status !== "SCHEDULED" || new Date(promo.startsAt) <= new Date())) {
        return false
      } else if (activeTab === "expiradas" && promo.status !== "EXPIRED") {
        return false
      }

      return true
    })
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Link href="/dashboard/promociones/asistente">
          <Button className="bg-granito hover:bg-granito/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva promoción
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadPromotions} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar promociones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="próximas">Próximas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <LoadingState message="Cargando promociones..." />
          ) : filteredPromotions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPromotions.map((promo) => (
                <Link key={promo.id} href={`/dashboard/promociones/${promo.id}`}>
                  <div className="border rounded-lg p-4 hover:border-granito hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-granito mr-2" />
                        <h3 className="font-medium">{promo.title}</h3>
                      </div>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          promo.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : promo.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {promo.status === "ACTIVE"
                          ? "Activa"
                          : promo.status === "SCHEDULED"
                            ? "Programada"
                            : "Expirada"}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {promo.isAutomatic ? "Descuento automático" : `Código: ${promo.code}`}
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {promo.valueType === "percentage"
                        ? `${promo.value}% de descuento`
                        : `${promo.value} ${promo.currencyCode} de descuento`}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {promo.startsAt && `Desde: ${formatDate(promo.startsAt)}`}
                      {promo.endsAt && ` · Hasta: ${formatDate(promo.endsAt)}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Tag className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium">No hay promociones</h3>
              <p className="text-gray-500 mt-1 mb-4">Crea tu primera promoción para atraer más clientes a tu tienda.</p>
              <Link href="/dashboard/promociones/asistente">
                <Button className="bg-granito hover:bg-granito/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva promoción
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
