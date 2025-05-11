"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { LoadingState } from "@/components/loading-state"
import { fetchPromotionById, updatePromotion } from "@/lib/api/promotions"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, ExternalLink, Edit, Trash, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function PromocionDetailPage({ params }) {
  const { id } = params
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPromotionDetails = async () => {
      if (!session?.user || !id) return

      setLoading(true)
      try {
        const promotionData = await fetchPromotionById(id)
        if (promotionData) {
          setPromotion(promotionData)
        } else {
          setError("No se pudo cargar la información de la promoción")
        }
      } catch (err) {
        console.error("Error al cargar detalles de la promoción:", err)
        setError("Error al cargar los detalles de la promoción. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchPromotionDetails()
  }, [session, id])

  const handleToggleStatus = async () => {
    if (!promotion) return

    const newStatus = promotion.status === "active" ? "disabled" : "active"

    setUpdating(true)
    try {
      const updatedPromotion = await updatePromotion(promotion.id, {
        status: newStatus,
      })

      if (updatedPromotion) {
        setPromotion(updatedPromotion)
        toast({
          title: "Promoción actualizada",
          description: `La promoción ha sido ${newStatus === "active" ? "activada" : "desactivada"} correctamente.`,
        })
      } else {
        throw new Error("No se pudo actualizar la promoción")
      }
    } catch (err) {
      console.error("Error al actualizar la promoción:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la promoción.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyToClipboard = () => {
    if (!promotion?.code) return

    navigator.clipboard.writeText(promotion.code)
    toast({
      title: "Código copiado",
      description: `El código ${promotion.code} ha sido copiado al portapapeles.`,
    })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Activa", variant: "success" },
      scheduled: { label: "Programada", variant: "warning" },
      expired: { label: "Expirada", variant: "destructive" },
      disabled: { label: "Desactivada", variant: "secondary" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return <LoadingState message="Cargando detalles de la promoción..." />
  }

  if (error || !promotion) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">{error || "No se encontró la promoción"}</p>
              <Button onClick={() => router.push("/dashboard/promociones")}>Ver todas las promociones</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{promotion.title || `Promoción: ${promotion.code}`}</h1>
          {promotion.status && <div className="ml-2">{getStatusBadge(promotion.status)}</div>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/promociones/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          {promotion.adminUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={promotion.adminUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Ver en Shopify
              </a>
            </Button>
          )}
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Detalles de la promoción */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la promoción</CardTitle>
              <CardDescription>Creada el {formatDate(promotion.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Código</h3>
                  <div className="flex items-center gap-2">
                    <div className="font-mono bg-muted p-2 rounded-md">{promotion.code}</div>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo de descuento</h3>
                  <p className="font-medium">
                    {promotion.type === "percentage"
                      ? "Porcentaje"
                      : promotion.type === "fixed_amount"
                        ? "Importe fijo"
                        : promotion.type === "free_shipping"
                          ? "Envío gratis"
                          : promotion.type}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Valor del descuento</h3>
                  <p className="font-medium">
                    {promotion.type === "percentage"
                      ? `${promotion.value}%`
                      : promotion.type === "fixed_amount"
                        ? `${promotion.value}€`
                        : promotion.type === "free_shipping"
                          ? "Envío gratis"
                          : promotion.value}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Usos</h3>
                  <p className="font-medium">
                    {promotion.usageCount || 0} / {promotion.usageLimit ? promotion.usageLimit : "∞"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Periodo de validez</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                    <p className="font-medium">{formatDate(promotion.startsAt || promotion.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de fin</p>
                    <p className="font-medium">
                      {promotion.endsAt || promotion.endDate
                        ? formatDate(promotion.endsAt || promotion.endDate)
                        : "Sin fecha de fin"}
                    </p>
                  </div>
                </div>
              </div>

              {promotion.minimumRequirement && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Requisitos mínimos</h3>
                    <p className="font-medium">
                      {promotion.minimumRequirement.type === "subtotal"
                        ? `Subtotal mínimo: ${promotion.minimumRequirement.value}€`
                        : promotion.minimumRequirement.type === "quantity"
                          ? `Cantidad mínima: ${promotion.minimumRequirement.value} productos`
                          : JSON.stringify(promotion.minimumRequirement)}
                    </p>
                  </div>
                </>
              )}

              {promotion.customerEligibility && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Elegibilidad de clientes</h3>
                    <p className="font-medium">
                      {promotion.customerEligibility === "all"
                        ? "Todos los clientes"
                        : promotion.customerEligibility === "specific"
                          ? "Clientes específicos"
                          : promotion.customerEligibility}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={promotion.status === "active" || promotion.active}
                  onCheckedChange={handleToggleStatus}
                  disabled={updating || promotion.status === "expired"}
                />
                <span>{promotion.status === "active" || promotion.active ? "Activa" : "Inactiva"}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Descripción y condiciones */}
          {(promotion.description || promotion.conditions) && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción y condiciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promotion.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                    <p>{promotion.description}</p>
                  </div>
                )}

                {promotion.conditions && promotion.conditions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Condiciones</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {promotion.conditions.map((condition, index) => (
                        <li key={index}>
                          {condition.type === "MINIMUM_AMOUNT"
                            ? `Pedido mínimo: ${condition.value}€`
                            : condition.type === "MINIMUM_QUANTITY"
                              ? `Cantidad mínima: ${condition.value} productos`
                              : JSON.stringify(condition)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Usos totales</p>
                  <p className="text-2xl font-bold">{promotion.usageCount || 0}</p>
                </div>

                {promotion.revenue !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos generados</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(promotion.revenue || 0)}
                    </p>
                  </div>
                )}

                {promotion.discountAmount !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descuento total aplicado</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(promotion.discountAmount || 0)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aplicabilidad */}
          <Card>
            <CardHeader>
              <CardTitle>Aplicabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promotion.appliesTo && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Se aplica a</h3>
                    <p className="font-medium">
                      {promotion.appliesTo === "all_products"
                        ? "Todos los productos"
                        : promotion.appliesTo === "specific_products"
                          ? "Productos específicos"
                          : promotion.appliesTo === "specific_collections"
                            ? "Colecciones específicas"
                            : promotion.appliesTo}
                    </p>
                  </div>
                )}

                {promotion.targetSelection && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Selección de objetivo</h3>
                    <p className="font-medium">
                      {promotion.targetSelection === "all"
                        ? "Todos los productos elegibles"
                        : promotion.targetSelection === "entitled"
                          ? "Productos específicos"
                          : promotion.targetSelection}
                    </p>
                  </div>
                )}

                {promotion.allocationMethod && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Método de asignación</h3>
                    <p className="font-medium">
                      {promotion.allocationMethod === "each"
                        ? "Cada uno"
                        : promotion.allocationMethod === "across"
                          ? "A través de todos"
                          : promotion.allocationMethod}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
