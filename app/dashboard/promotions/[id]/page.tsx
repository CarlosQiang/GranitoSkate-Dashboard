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

export default function PromotionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPromotion() {
      try {
        setIsLoading(true)
        // El ID puede ser el ID completo o solo el número
        const id = params.id

        // Verificar si el ID existe antes de intentar cargarlo
        const data = await fetchPriceListById(id)

        if (!data) {
          throw new Error("No se encontró la promoción")
        }

        setPromotion(data)
        setError(null)
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
      router.push("/dashboard/promotions")
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

  const togglePromotionStatus = async () => {
    if (!promotion) return

    try {
      const now = new Date()
      const isActive = promotion.status === "ACTIVE"

      // Si está activa, la desactivamos poniendo la fecha de fin en el pasado
      // Si está inactiva, la activamos quitando la fecha de fin
      const updateData = {
        endsAt: isActive ? new Date(now.getTime() - 86400000).toISOString() : undefined,
      }

      await updatePriceList(params.id, updateData)

      toast({
        title: isActive ? "Promoción desactivada" : "Promoción activada",
        description: isActive
          ? "La promoción ha sido desactivada correctamente"
          : "La promoción ha sido activada correctamente",
      })

      // Actualizar el estado local
      setPromotion({
        ...promotion,
        status: isActive ? "EXPIRED" : "ACTIVE",
        endsAt: isActive ? new Date(now.getTime() - 86400000).toISOString() : undefined,
      })
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
      const minQuantity = promotion.minimumRequirement?.value || "X"
      return `Compra ${minQuantity} y llévate ${promotion.value}`
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
              No se pudo cargar la información de la promoción. Es posible que la promoción haya sido eliminada o que el
              ID no sea válido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/promotions")}>
                Volver a promociones
              </Button>
              <Button onClick={() => window.location.reload()}>
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
          <Button variant={promotion.status === "ACTIVE" ? "outline" : "default"} onClick={togglePromotionStatus}>
            {promotion.status === "ACTIVE" ? "Desactivar" : "Activar"}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/promotions/${params.id}/edit`)}>
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
                {formatDateSafe(promotion.startsAt)}
                {promotion.endsAt ? ` - ${formatDateSafe(promotion.endsAt)}` : " - Sin fecha de fin"}
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
                  {promotion.usageCount || 0} / {promotion.usageLimit}
                </span>
              </div>
            )}

            {promotion.summary && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{promotion.summary}</p>
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

            {promotion.minimumRequirement && (
              <div>
                <h3 className="text-sm font-medium mb-2">Requisitos:</h3>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  {promotion.minimumRequirement.type === "MINIMUM_AMOUNT" && (
                    <span>Compra mínima de {promotion.minimumRequirement.value}€</span>
                  )}
                  {promotion.minimumRequirement.type === "MINIMUM_QUANTITY" && (
                    <span>Cantidad mínima de {promotion.minimumRequirement.value} productos</span>
                  )}
                </div>
              </div>
            )}

            <Alert className="mt-4">
              <Calendar className="h-4 w-4" />
              <AlertTitle>Información de uso</AlertTitle>
              <AlertDescription>
                Esta promoción ha sido utilizada {promotion.usageCount || 0} veces desde su creación.
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay productos específicos</p>
                <p className="text-muted-foreground max-w-md">
                  {promotion.target === "CART"
                    ? "Esta promoción se aplica a todos los productos de la tienda que cumplan las condiciones."
                    : "No hay productos específicos asociados a esta promoción."}
                </p>
              </div>
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
                  Esta promoción está disponible para todos los clientes que cumplan con las condiciones establecidas.
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
