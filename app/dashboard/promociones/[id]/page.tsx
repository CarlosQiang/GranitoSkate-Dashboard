"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchPriceListById, deletePriceList, updatePriceList } from "@/lib/api/promotions"
import type { Promotion } from "@/types/promotions"
import {
  ArrowLeft,
  Calendar,
  Tag,
  Percent,
  ShoppingBag,
  Trash2,
  Edit,
  AlertTriangle,
  RefreshCw,
  Users,
  Package,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
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

// Importar las funciones de utilidad al inicio
import { createShopifyGid } from "@/lib/utils/shopify-id"

export default function PromotionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Actualizar la función useEffect para manejar correctamente los errores y mostrar la información

  useEffect(() => {
    async function loadPromotion() {
      try {
        setIsLoading(true)
        console.log(`Cargando promoción con ID: ${params.id}`)

        // Primero intentar con el ID tal como viene
        let data = await fetchPriceListById(params.id)

        // Si no funciona, intentar con el GID completo
        if (!data) {
          const shopifyGid = createShopifyGid(params.id, "DiscountAutomaticNode")
          console.log(`Intentando con GID: ${shopifyGid}`)
          data = await fetchPriceListById(shopifyGid)
        }

        // Si aún no funciona, intentar obtener desde Shopify directamente
        if (!data) {
          console.log("Intentando obtener desde Shopify...")
          const response = await fetch(`/api/shopify/promotions/${params.id}`)
          if (response.ok) {
            data = await response.json()
          }
        }

        if (data) {
          setPromotion(data)
          setError(null)
        } else {
          throw new Error("No se pudo obtener la información de la promoción")
        }
      } catch (err) {
        console.error("Error al cargar la promoción:", err)
        setError(`No se pudo cargar la promoción: ${(err as Error).message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromotion()
  }, [params.id])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deletePriceList(params.id)
      toast({
        title: "Promoción eliminada",
        description: "La promoción ha sido eliminada correctamente",
      })
      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar la promoción: ${(error as Error).message}`,
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  // Actualizar la función togglePromotionStatus para manejar correctamente los errores

  const togglePromotionStatus = async () => {
    if (!promotion) return

    try {
      const now = new Date()
      const isActive = promotion.active

      // Mostrar toast de carga
      toast({
        title: isActive ? "Desactivando promoción..." : "Activando promoción...",
        description: "Por favor espere mientras procesamos su solicitud",
      })

      // Si está activa, la desactivamos poniendo la fecha de fin en el pasado
      // Si está inactiva, la activamos quitando la fecha de fin
      const updateData = {
        endDate: isActive ? new Date(now.getTime() - 86400000).toISOString() : undefined,
        active: !isActive, // Añadir explícitamente el cambio de estado
      }

      // Intentar actualizar la promoción
      const updatedPromotion = await updatePriceList(params.id, updateData)

      // Mostrar toast de éxito
      toast({
        title: isActive ? "Promoción desactivada" : "Promoción activada",
        description: isActive
          ? "La promoción ha sido desactivada correctamente"
          : "La promoción ha sido activada correctamente",
      })

      // Actualizar el estado local con los datos devueltos por la API
      if (updatedPromotion) {
        setPromotion(updatedPromotion)
      } else {
        // Si no hay datos, actualizar manualmente
        setPromotion({
          ...promotion,
          active: !isActive,
          endDate: isActive ? new Date(now.getTime() - 86400000).toISOString() : undefined,
        })
      }
    } catch (error) {
      console.error("Error updating promotion status:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado de la promoción: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  // Función para formatear el valor de la promoción
  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.type === "PERCENTAGE_DISCOUNT") {
      return `${promotion.value}% de descuento`
    } else if (promotion.type === "FIXED_AMOUNT_DISCOUNT") {
      return `${promotion.value}€ de descuento`
    } else if (promotion.type === "BUY_X_GET_Y") {
      return `Compra ${promotion.conditions?.[0]?.value || 1} y llévate ${promotion.value}`
    }
    return `${promotion.value}`
  }

  // Función para obtener el icono según el tipo de promoción
  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE_DISCOUNT":
        return <Percent className="h-6 w-6 text-green-500" />
      case "FIXED_AMOUNT_DISCOUNT":
        return <Tag className="h-6 w-6 text-blue-500" />
      case "BUY_X_GET_Y":
        return <ShoppingBag className="h-6 w-6 text-purple-500" />
      default:
        return <Tag className="h-6 w-6 text-gray-500" />
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !promotion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error al cargar la promoción</CardTitle>
            </div>
            <CardDescription>
              No se pudo cargar la información de la promoción. Es posible que la promoción haya sido eliminada o que no
              tengas permisos para acceder a ella.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/promociones")}>
                Volver a promociones
              </Button>
              <Button onClick={() => setRetryCount((prev) => prev + 1)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = getPromotionStatus(promotion)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{promotion.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant={promotion.active ? "outline" : "default"} onClick={togglePromotionStatus}>
            {promotion.active ? "Desactivar" : "Activar"}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/promociones/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
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
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPromotionIcon(promotion.type)}
              <span>Detalles de la promoción</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Estado:</span>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Tipo:</span>
              <span>
                {promotion.type === "PERCENTAGE_DISCOUNT"
                  ? "Descuento porcentual"
                  : promotion.type === "FIXED_AMOUNT_DISCOUNT"
                    ? "Descuento de cantidad fija"
                    : promotion.type === "BUY_X_GET_Y"
                      ? "Compra X y llévate Y"
                      : "Envío gratuito"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Valor:</span>
              <span className="font-bold">{formatPromotionValue(promotion)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Periodo:</span>
              <span>
                {format(new Date(promotion.startDate), "dd MMM yyyy", { locale: es })}
                {promotion.endDate
                  ? ` - ${format(new Date(promotion.endDate), "dd MMM yyyy", { locale: es })}`
                  : " - Sin fecha de fin"}
              </span>
            </div>

            {promotion.code && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Código:</span>
                <Badge variant="secondary" className="text-lg font-mono">
                  {promotion.code}
                </Badge>
              </div>
            )}

            {promotion.usageLimit && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Límite de usos:</span>
                <span>
                  {promotion.usageCount} / {promotion.usageLimit}
                </span>
              </div>
            )}

            {promotion.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{promotion.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aplicación</CardTitle>
            <CardDescription>Dónde y cómo se aplica esta promoción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
              {promotion.target === "COLLECTION" ? (
                <Package className="h-5 w-5 text-blue-500" />
              ) : promotion.target === "PRODUCT" ? (
                <Package className="h-5 w-5 text-green-500" />
              ) : (
                <ShoppingBag className="h-5 w-5 text-purple-500" />
              )}
              <div>
                <p className="font-medium">
                  {promotion.target === "COLLECTION"
                    ? "Aplicada a una colección"
                    : promotion.target === "PRODUCT"
                      ? "Aplicada a un producto"
                      : "Aplicada a toda la tienda"}
                </p>
                {promotion.targetId && <p className="text-sm text-muted-foreground">ID: {promotion.targetId}</p>}
              </div>
            </div>

            {promotion.conditions && promotion.conditions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Condiciones:</h3>
                <ul className="space-y-2">
                  {promotion.conditions.map((condition, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      {condition.type === "MINIMUM_AMOUNT" && <span>Compra mínima de {condition.value}€</span>}
                      {condition.type === "MINIMUM_QUANTITY" && (
                        <span>Cantidad mínima de {condition.value} productos</span>
                      )}
                      {condition.type === "SPECIFIC_CUSTOMER_GROUP" && (
                        <span>Solo para grupo de clientes específico</span>
                      )}
                      {condition.type === "DATE_RANGE" && condition.value && (
                        <span>
                          Válido del {format(new Date(condition.value.start), "dd/MM/yyyy")} al{" "}
                          {format(new Date(condition.value.end), "dd/MM/yyyy")}
                        </span>
                      )}
                      {condition.type === "FIRST_PURCHASE" && <span>Solo para primera compra</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Alert className="mt-4">
              <Calendar className="h-4 w-4" />
              <AlertTitle>Información de uso</AlertTitle>
              <AlertDescription>
                Esta promoción ha sido utilizada {promotion.usageCount} veces desde su creación.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos aplicables</TabsTrigger>
          <TabsTrigger value="customers">Clientes elegibles</TabsTrigger>
          <TabsTrigger value="analytics">Análisis de rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos con esta promoción</CardTitle>
              <CardDescription>Lista de productos a los que se aplica esta promoción</CardDescription>
            </CardHeader>
            <CardContent>
              {promotion.prices && promotion.prices.length > 0 ? (
                <div className="space-y-2">
                  {promotion.prices.map((price, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border-b">
                      <span>{price.productTitle}</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: price.price?.currencyCode || "EUR",
                        }).format(Number(price.price?.amount || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No hay productos específicos</p>
                  <p className="text-muted-foreground max-w-md">
                    {promotion.target === "CART"
                      ? "Esta promoción se aplica a todos los productos de la tienda que cumplan las condiciones."
                      : "No hay productos específicos asociados a esta promoción."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes elegibles</CardTitle>
              <CardDescription>Clientes que pueden utilizar esta promoción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Disponible para todos los clientes</p>
                <p className="text-muted-foreground max-w-md">
                  {promotion.conditions && promotion.conditions.some((c) => c.type === "FIRST_PURCHASE")
                    ? "Esta promoción está disponible solo para clientes que realizan su primera compra."
                    : "Esta promoción está disponible para todos los clientes que cumplan con las condiciones establecidas."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de rendimiento</CardTitle>
              <CardDescription>Estadísticas de uso y efectividad de la promoción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Análisis no disponible</p>
                <p className="text-muted-foreground max-w-md">
                  Las estadísticas detalladas de rendimiento estarán disponibles próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
