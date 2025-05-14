"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react"
import { fetchOrderById } from "@/lib/api/orders"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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

  const handleRetry = async () => {
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Separator />
            <div>
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
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
            <Button onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Pedido {order.name}</h1>
        </div>
        <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
          {order.displayFulfillmentStatus || "PENDIENTE"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del pedido</CardTitle>
          <CardDescription>
            Realizado el {formatDate(order.processedAt)} • Estado de pago:{" "}
            <Badge variant="outline">{order.displayFinancialStatus || "PENDIENTE"}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Cliente</h3>
              {order.customer ? (
                <div className="text-sm space-y-1">
                  <p>
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p>{order.customer.email}</p>
                  {order.customer.phone && <p>{order.customer.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Cliente no registrado</p>
              )}
            </div>
            {order.shippingAddress && (
              <div>
                <h3 className="font-medium mb-2">Dirección de envío</h3>
                <div className="text-sm space-y-1">
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-4">Productos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No hay productos en este pedido
                    </TableCell>
                  </TableRow>
                ) : (
                  order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        {item.productId && <div className="text-xs text-muted-foreground">ID: {item.productId}</div>}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price, item.currencyCode)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((Number.parseFloat(item.price) * item.quantity).toFixed(2), item.currencyCode)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 ml-auto w-full max-w-xs">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotalPrice, order.currencyCode)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>{formatCurrency(order.shippingPrice, order.currencyCode)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuestos</span>
              <span>{formatCurrency(order.taxPrice, order.currencyCode)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice, order.currencyCode)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
