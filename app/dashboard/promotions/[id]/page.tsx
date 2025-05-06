"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Tag, Users, Percent, AlertCircle } from "lucide-react"
import { fetchPriceListById, deletePriceList } from "@/lib/api/promotions"
import { useToast } from "@/components/ui/use-toast"
import { AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PromotionSeoForm } from "@/components/promotion-seo-form"
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
  const [promotion, setPromotion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPromotion() {
      setIsLoading(true)
      try {
        const data = await fetchPriceListById(params.id)
        setPromotion(data)
        setError(null)
      } catch (error: any) {
        setError(error.message)
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-[240px]" />
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

  if (error) {
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <p>Hubo un error al cargar la información de la promoción.</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </AlertDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Promoción no encontrada</h1>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <AlertTitle>Promoción no encontrada</AlertTitle>
            <AlertDescription>La promoción solicitada no existe.</AlertDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

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
          <Button variant="outline" onClick={() => router.push(`/dashboard/promotions/${params.id}/edit`)}>
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
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
                <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la promoción</CardTitle>
                <CardDescription>Detalles generales de la promoción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium leading-none">Tipo</h4>
                    <p className="text-sm text-muted-foreground">{promotion.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium leading-none">Valor</h4>
                    <p className="text-sm text-muted-foreground">{promotion.value}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium leading-none">Periodo</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(promotion.startsAt), "dd/MM/yyyy", { locale: es })} -{" "}
                      {promotion.endsAt
                        ? format(new Date(promotion.endsAt), "dd/MM/yyyy", { locale: es })
                        : "Sin fecha de fin"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium leading-none">Límite de uso</h4>
                    <p className="text-sm text-muted-foreground">{promotion.usageLimit || "Sin límite"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium leading-none">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{promotion.description}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
                <CardDescription>Información sobre el estado actual de la promoción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium leading-none">Estado actual</h4>
                    <Badge variant="secondary">{promotion.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="seo">
          <PromotionSeoForm
            promotionId={promotion.id}
            promotionTitle={promotion.title}
            promotionDescription={promotion.description || promotion.summary || ""}
            promotionType={promotion.type}
            promotionValue={promotion.value}
            promotionStartDate={promotion.startsAt}
            promotionEndDate={promotion.endsAt}
            promotionCode={promotion.code}
          />
        </TabsContent>
        <TabsContent value="analytics">
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
