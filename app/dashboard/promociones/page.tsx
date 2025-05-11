"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchPromotions } from "@/lib/api/promotions"
import { AlertCircle, Plus, RefreshCw, Tag } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import ShopifyConnectionChecker from "@/components/shopify-connection-checker"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([])
  const [filteredPromotions, setFilteredPromotions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadPromotions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPromotions(50)
      setPromotions(data)
      setFilteredPromotions(data)
      setLoading(false)
    } catch (err) {
      console.error("Error al cargar promociones:", err)
      setError(err.message || "Error al cargar promociones. Por favor, inténtalo de nuevo.")
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [retryCount])

  useEffect(() => {
    if (!promotions) return

    let filtered = [...promotions]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (promo) =>
          promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por estado
    if (activeTab !== "todas") {
      if (activeTab === "activas") {
        filtered = filtered.filter((promo) => promo.status === "ACTIVE")
      } else if (activeTab === "proximas") {
        filtered = filtered.filter(
          (promo) => promo.status === "SCHEDULED" || (promo.startsAt && new Date(promo.startsAt) > new Date()),
        )
      } else if (activeTab === "expiradas") {
        filtered = filtered.filter(
          (promo) => promo.status === "EXPIRED" || (promo.endsAt && new Date(promo.endsAt) < new Date()),
        )
      }
    }

    setFilteredPromotions(filtered)
  }, [searchTerm, activeTab, promotions])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const getStatusBadge = (status, startsAt, endsAt) => {
    const now = new Date()
    const start = startsAt ? new Date(startsAt) : null
    const end = endsAt ? new Date(endsAt) : null

    if (status === "ACTIVE" || (start && start <= now && (!end || end >= now))) {
      return <Badge className="bg-green-500">Activa</Badge>
    } else if (status === "SCHEDULED" || (start && start > now)) {
      return <Badge className="bg-blue-500">Programada</Badge>
    } else if (status === "EXPIRED" || (end && end < now)) {
      return <Badge className="bg-gray-500">Expirada</Badge>
    } else {
      return <Badge className="bg-yellow-500">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <ShopifyConnectionChecker />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Link href="/dashboard/promociones/asistente">
          <Button className="bg-granito hover:bg-granito/90">
            <Plus className="mr-2 h-4 w-4" /> Nueva promoción
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>No se pudieron cargar las promociones. Por favor, inténtalo de nuevo.</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
              <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-4">
        <Input placeholder="Buscar promociones..." value={searchTerm} onChange={handleSearch} className="max-w-md" />

        <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="activas">Activas</TabsTrigger>
            <TabsTrigger value="proximas">Próximas</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPromotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promotion) => (
            <Card key={promotion.id} className={promotion.error ? "border-red-300" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{promotion.title}</CardTitle>
                  {getStatusBadge(promotion.status, promotion.startsAt, promotion.endsAt)}
                </div>
                <CardDescription>
                  {promotion.isAutomatic ? "Descuento automático" : `Código: ${promotion.code}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      {promotion.valueType === "percentage"
                        ? `${promotion.value}%`
                        : `${promotion.value} ${promotion.currencyCode}`}
                    </span>
                  </div>
                  {promotion.minimumRequirement && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mínimo:</span>
                      <span className="font-medium">
                        {promotion.minimumRequirement.value} {promotion.currencyCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vigencia:</span>
                    <span className="font-medium">
                      {formatDate(promotion.startsAt)} - {promotion.endsAt ? formatDate(promotion.endsAt) : "Sin fin"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!promotion.error ? (
                  <Link href={`/dashboard/promociones/${promotion.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <Tag className="mr-2 h-4 w-4" /> Ver detalles
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay promociones</h3>
          <p className="text-muted-foreground mb-6">Crea tu primera promoción para atraer más clientes a tu tienda.</p>
          <Link href="/dashboard/promociones/asistente">
            <Button className="bg-granito hover:bg-granito/90">
              <Plus className="mr-2 h-4 w-4" /> Nueva promoción
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
