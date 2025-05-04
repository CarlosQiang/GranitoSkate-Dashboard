"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fetchPriceLists, deletePriceList } from "@/lib/api/promotions"
import type { Promotion } from "@/types/promotions"
import { Plus, Search, Tag, Percent, ShoppingBag, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function PromotionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function loadPromotions() {
      try {
        setIsLoading(true)
        const data = await fetchPriceLists()
        setPromotions(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError("No se pudieron cargar las promociones. Por favor, inténtalo de nuevo.")
        setPromotions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPromotions()
  }, [])

  const handleDeletePromotion = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta promoción? Esta acción no se puede deshacer.")) {
      try {
        setIsDeleting(id)
        await deletePriceList(id)
        setPromotions(promotions.filter((promo) => promo.id !== id))
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
        setIsDeleting(null)
      }
    }
  }

  // Filtrar promociones según la pestaña activa y el término de búsqueda
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = promo.title.toLowerCase().includes(searchTerm.toLowerCase())
    const isActive =
      new Date(promo.startDate) <= new Date() && (!promo.endDate || new Date(promo.endDate) >= new Date())
    const isUpcoming = new Date(promo.startDate) > new Date()
    const isExpired = promo.endDate && new Date(promo.endDate) < new Date()

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && isActive
    if (activeTab === "upcoming") return matchesSearch && isUpcoming
    if (activeTab === "expired") return matchesSearch && isExpired
    return matchesSearch
  })

  // Función para renderizar el icono según el tipo de promoción
  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE_DISCOUNT":
        return <Percent className="h-5 w-5 text-green-500" />
      case "FIXED_AMOUNT_DISCOUNT":
        return <Tag className="h-5 w-5 text-blue-500" />
      case "BUY_X_GET_Y":
        return <ShoppingBag className="h-5 w-5 text-purple-500" />
      default:
        return <Tag className="h-5 w-5 text-gray-500" />
    }
  }

  // Función para formatear el valor de la promoción
  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.type === "PERCENTAGE_DISCOUNT") {
      return `${promotion.value}% de descuento`
    } else if (promotion.type === "FIXED_AMOUNT_DISCOUNT") {
      return `${promotion.value}€ de descuento`
    } else if (promotion.type === "BUY_X_GET_Y") {
      return `Compra ${promotion.conditions[0]?.value} y llévate ${promotion.value}`
    }
    return `${promotion.value}`
  }

  // Función para formatear el estado de la promoción
  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date()
    const startDate = new Date(promotion.startDate)
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null

    if (startDate > now) {
      return { label: "Próximamente", color: "bg-blue-100 text-blue-800" }
    } else if (endDate && endDate < now) {
      return { label: "Expirada", color: "bg-gray-100 text-gray-800" }
    } else if (!promotion.active) {
      return { label: "Inactiva", color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { label: "Activa", color: "bg-green-100 text-green-800" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button onClick={() => router.push("/dashboard/promotions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva promoción
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar promociones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="expired">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-24 bg-gray-100"></CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPromotions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay promociones</p>
                <p className="text-muted-foreground text-center mb-6">
                  {searchTerm
                    ? "No se encontraron promociones que coincidan con tu búsqueda."
                    : "Crea tu primera promoción para atraer más clientes a tu tienda."}
                </p>
                <Button onClick={() => router.push("/dashboard/promotions/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva promoción
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPromotions.map((promotion) => {
                const status = getPromotionStatus(promotion)
                return (
                  <Card key={promotion.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-col space-y-1">
                        <CardTitle className="line-clamp-1">{promotion.title}</CardTitle>
                        <CardDescription>
                          {promotion.target === "COLLECTION"
                            ? "Aplicada a una colección"
                            : promotion.target === "PRODUCT"
                              ? "Aplicada a un producto"
                              : "Aplicada a toda la tienda"}
                        </CardDescription>
                      </div>
                      {getPromotionIcon(promotion.type)}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Descuento:</span>
                          <span className="font-bold">{formatPromotionValue(promotion)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Periodo:</span>
                          <span className="text-sm">
                            {format(new Date(promotion.startDate), "dd MMM", { locale: es })} -{" "}
                            {promotion.endDate
                              ? format(new Date(promotion.endDate), "dd MMM", { locale: es })
                              : "Sin fin"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Estado:</span>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/promotions/${promotion.id}`)}
                          >
                            Ver detalles
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePromotion(promotion.id)}
                            disabled={isDeleting === promotion.id}
                          >
                            {isDeleting === promotion.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
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
