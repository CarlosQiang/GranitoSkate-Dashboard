"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fetchPriceLists, fetchMarketingActivities, deletePriceList } from "@/lib/api/promotions"
import type { Promotion, MarketingActivity } from "@/types/promotions"
import {
  Plus,
  Search,
  Tag,
  Percent,
  ShoppingBag,
  AlertCircle,
  Loader2,
  RefreshCw,
  Truck,
  Megaphone,
  Facebook,
  Instagram,
  Mail,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PromotionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [marketingActivities, setMarketingActivities] = useState<MarketingActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMarketing, setIsLoadingMarketing] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [mainTab, setMainTab] = useState("discounts")
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const data = await fetchPriceLists()

        if (!data || !Array.isArray(data)) {
          throw new Error("No se recibieron datos válidos de promociones")
        }

        setPromotions(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError(`No se pudieron cargar las promociones: ${(err as Error).message}`)
        setPromotions([])
      } finally {
        setIsLoading(false)
      }

      try {
        setIsLoadingMarketing(true)
        const marketingData = await fetchMarketingActivities()
        setMarketingActivities(marketingData)
      } catch (err) {
        console.error("Error al cargar actividades de marketing:", err)
      } finally {
        setIsLoadingMarketing(false)
      }
    }

    loadData()
  }, [])

  const handleDeletePromotion = async (id: string) => {
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

  // Función para formatear fechas de manera segura
  const formatDateSafe = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha inválida"
      }
      return format(date, "dd MMM yyyy", { locale: es })
    } catch (error) {
      console.error("Error al formatear fecha:", error, dateString)
      return "Fecha inválida"
    }
  }

  // Filtrar promociones según la pestaña activa y el término de búsqueda
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = promo.title.toLowerCase().includes(searchTerm.toLowerCase())

    // Verificar fechas de manera segura
    let isActive = false
    let isUpcoming = false
    let isExpired = false

    try {
      const now = new Date()
      const startDate = promo.startsAt ? new Date(promo.startsAt) : null
      const endDate = promo.endsAt ? new Date(promo.endsAt) : null

      if (startDate && !isNaN(startDate.getTime())) {
        if (endDate && !isNaN(endDate.getTime())) {
          isActive = startDate <= now && endDate >= now
          isExpired = endDate < now
        } else {
          isActive = startDate <= now
        }
        isUpcoming = startDate > now
      }
    } catch (error) {
      console.error("Error al procesar fechas de promoción:", error, promo)
    }

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && isActive
    if (activeTab === "upcoming") return matchesSearch && isUpcoming
    if (activeTab === "expired") return matchesSearch && isExpired
    return matchesSearch
  })

  // Filtrar actividades de marketing según el término de búsqueda
  const filteredMarketingActivities = marketingActivities.filter((activity) => {
    return activity.title.toLowerCase().includes(searchTerm.toLowerCase())
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
      case "FREE_SHIPPING":
        return <Truck className="h-5 w-5 text-orange-500" />
      default:
        return <Tag className="h-5 w-5 text-gray-500" />
    }
  }

  // Función para renderizar el icono según el tipo de actividad de marketing
  const getMarketingIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />
      case "instagram":
        return <Instagram className="h-5 w-5 text-pink-600" />
      case "email":
        return <Mail className="h-5 w-5 text-yellow-600" />
      default:
        return <Megaphone className="h-5 w-5 text-purple-500" />
    }
  }

  // Función para formatear el valor de la promoción
  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.type === "PERCENTAGE_DISCOUNT") {
      return `${promotion.value}% de descuento`
    } else if (promotion.type === "FIXED_AMOUNT_DISCOUNT") {
      return `${promotion.value}€ de descuento`
    } else if (promotion.type === "BUY_X_GET_Y") {
      return `Compra ${promotion.minimumRequirement?.value || "X"} y llévate ${promotion.value}`
    } else if (promotion.type === "FREE_SHIPPING") {
      return "Envío gratuito"
    }
    return `${promotion.value}`
  }

  // Función para formatear el estado de la promoción
  const getPromotionStatus = (promotion: Promotion) => {
    try {
      if (promotion.status === "ACTIVE") {
        return { label: "Activa", color: "bg-green-100 text-green-800" }
      } else if (promotion.status === "EXPIRED") {
        return { label: "Expirada", color: "bg-gray-100 text-gray-800" }
      } else if (promotion.status === "SCHEDULED") {
        return { label: "Próximamente", color: "bg-blue-100 text-blue-800" }
      } else {
        return { label: "Inactiva", color: "bg-yellow-100 text-yellow-800" }
      }
    } catch (error) {
      console.error("Error al determinar estado de promoción:", error, promotion)
      return { label: "Estado desconocido", color: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing y Promociones</h1>
          <p className="text-muted-foreground">
            Gestiona las promociones, descuentos y campañas de marketing de tu tienda
          </p>
        </div>
        <div className="flex gap-2">
          {mainTab === "discounts" ? (
            <Button asChild>
              <Link href="/dashboard/promotions/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva promoción
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/promotions/marketing/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva campaña
              </Link>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="w-fit flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="discounts" value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discounts">Descuentos y Promociones</TabsTrigger>
          <TabsTrigger value="marketing">Campañas de Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts" className="space-y-4">
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
                      <CardContent className="p-6">
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
                    <Button asChild>
                      <Link href="/dashboard/promotions/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva promoción
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPromotions.map((promotion) => {
                    const status = getPromotionStatus(promotion)
                    return (
                      <Card key={promotion.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-lg line-clamp-1">{promotion.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {promotion.target === "COLLECTION"
                                  ? "Aplicada a una colección"
                                  : promotion.target === "PRODUCT"
                                    ? "Aplicada a un producto"
                                    : "Aplicada a toda la tienda"}
                              </p>
                            </div>
                            {getPromotionIcon(promotion.type)}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Descuento:</span>
                              <span className="font-bold">{formatPromotionValue(promotion)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Periodo:</span>
                              <span className="text-sm">
                                {formatDateSafe(promotion.startsAt)} -{" "}
                                {promotion.endsAt ? formatDateSafe(promotion.endsAt) : "Sin fin"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Estado:</span>
                              <Badge variant="outline" className={status.color}>
                                {status.label}
                              </Badge>
                            </div>
                            {promotion.code && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Código:</span>
                                <Badge variant="secondary" className="font-mono">
                                  {promotion.code}
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-4">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/promotions/${promotion.id.includes("/") ? promotion.id.split("/").pop() : promotion.id}`}
                                >
                                  Ver detalles
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={isDeleting === promotion.id}>
                                    {isDeleting === promotion.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Eliminar"
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente la promoción.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePromotion(promotion.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar campañas de marketing..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoadingMarketing ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMarketingActivities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay campañas de marketing</p>
                <p className="text-muted-foreground text-center mb-6">
                  {searchTerm
                    ? "No se encontraron campañas que coincidan con tu búsqueda."
                    : "Crea tu primera campaña de marketing para promocionar tu tienda."}
                </p>
                <Button asChild>
                  <Link href="/dashboard/promotions/marketing/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva campaña
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMarketingActivities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg line-clamp-1">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">{activity.channel || "Canal desconocido"}</p>
                      </div>
                      {getMarketingIcon(activity.channel || "")}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estado:</span>
                        <Badge
                          variant="outline"
                          className={
                            activity.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : activity.status === "SCHEDULED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {activity.status === "ACTIVE"
                            ? "Activa"
                            : activity.status === "SCHEDULED"
                              ? "Programada"
                              : "Finalizada"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Periodo:</span>
                        <span className="text-sm">
                          {formatDateSafe(activity.startDate)} -{" "}
                          {activity.endDate ? formatDateSafe(activity.endDate) : "Sin fin"}
                        </span>
                      </div>
                      {activity.budget && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Presupuesto:</span>
                          <span className="font-bold">
                            {activity.budget.amount} {activity.budget.currencyCode}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/promotions/marketing/${activity.id.split("/").pop()}`}>
                            Ver detalles
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/promotions/marketing/${activity.id.split("/").pop()}/edit`}>
                            Editar
                          </Link>
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
    </div>
  )
}
