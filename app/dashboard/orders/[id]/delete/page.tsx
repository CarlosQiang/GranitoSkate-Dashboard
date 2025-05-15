"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle, RefreshCw, Trash2, AlertTriangle, ShoppingCart } from "lucide-react"
import { fetchOrderById, deleteOrder } from "@/lib/api/orders"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function DeleteOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const orderId = params?.id

  useEffect(() => {
    if (!orderId) return

    const getOrderDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchOrderById(orderId)
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order details:", error)
        setError(error.message || "No se pudo cargar los detalles del pedido")
      } finally {
        setIsLoading(false)
      }
    }

    getOrderDetails()
  }, [orderId])

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"

    switch (status.toUpperCase()) {
      case "FULFILLED":
        return "bg-green-100 text-green-800"
      case "UNFULFILLED":
        return "bg-yellow-100 text-yellow-800"
      case "PARTIALLY_FULFILLED":
        return "bg-blue-100 text-blue-800"
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true)
      await deleteOrder(orderId)

      toast({
        title: "Pedido eliminado",
        description: "El pedido ha sido cancelado y archivado correctamente",
        variant: "default",
      })

      // Redirigir a la lista de pedidos
      router.push("/dashboard/orders")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el pedido",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error al cargar el pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>
              Ver todos los pedidos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pedido no encontrado</CardTitle>
            <CardDescription>No se pudo encontrar el pedido solicitado</CardDescription>
          </CardHeader>
          <CardContent>
            <p>El pedido con ID {orderId} no existe o ha sido eliminado.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>
              Ver todos los pedidos
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Eliminar pedido {order.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Confirmar eliminación de pedido
          </CardTitle>
          <CardDescription>
            Estás a punto de eliminar el pedido {order.name} realizado el {formatDate(order.processedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Advertencia
            </h3>
            <p className="mb-3">
              Esta acción cancelará el pedido y lo archivará en Shopify. Esta acción no se puede deshacer.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Los pedidos eliminados no se pueden recuperar</li>
              <li>Si el pedido ya ha sido pagado, considera emitir un reembolso antes de eliminarlo</li>
              <li>Si el pedido ya ha sido enviado, no se recomienda eliminarlo</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-3">Resumen del pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Número de pedido</p>
                <p className="font-medium">{order.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">{formatDate(order.processedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
                  {order.displayFulfillmentStatus || "PENDIENTE"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium">{formatCurrency(order.totalPrice, order.currencyCode)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Cliente</p>
              {order.customer ? (
                <div>
                  <p className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-sm">{order.customer.email}</p>
                </div>
              ) : (
                <p className="text-sm">Cliente no registrado</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${orderId}`)} disabled={isDeleting}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ver detalles del pedido
          </Button>
          <Button variant="destructive" onClick={handleDeleteOrder} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar pedido
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
