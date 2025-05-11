"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingState } from "@/components/loading-state"
import { getOrderById } from "@/lib/api/orders"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Printer, Mail, ExternalLink } from "lucide-react"

export default function OrderDetailPage({ params }) {
  const { id } = params
  const { data: session } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!session?.user || !id) return

      setLoading(true)
      try {
        const orderData = await getOrderById(id)
        if (orderData) {
          setOrder(orderData)
        } else {
          setError("No se pudo cargar la información del pedido")
        }
      } catch (err) {
        console.error("Error al cargar detalles del pedido:", err)
        setError("Error al cargar los detalles del pedido. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [session, id])

  const getStatusBadge = (status) => {
    const statusMap = {
      fulfilled: { label: "Completado", variant: "success" },
      unfulfilled: { label: "Pendiente", variant: "warning" },
      partially_fulfilled: { label: "Parcial", variant: "info" },
      cancelled: { label: "Cancelado", variant: "destructive" },
      refunded: { label: "Reembolsado", variant: "secondary" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      paid: { label: "Pagado", variant: "success" },
      pending: { label: "Pendiente", variant: "warning" },
      partially_paid: { label: "Pago parcial", variant: "info" },
      refunded: { label: "Reembolsado", variant: "secondary" },
      voided: { label: "Anulado", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return <LoadingState message="Cargando detalles del pedido..." />
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">{error || "No se encontró el pedido"}</p>
              <Button onClick={() => router.push("/dashboard/orders")}>Ver todos los pedidos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency,
    }).format(amount || 0)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Pedido #{order.orderNumber || order.name}</h1>
          {order.fulfillmentStatus && <div className="ml-2">{getStatusBadge(order.fulfillmentStatus)}</div>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" /> Enviar email
          </Button>
          {order.adminUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={order.adminUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Ver en Shopify
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Detalles del pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del pedido</CardTitle>
              <CardDescription>Realizado el {formatDate(order.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
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
                    {order.lineItems?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{item.title}</div>
                          {item.variant && (
                            <div className="text-sm text-muted-foreground">
                              {item.variant.title !== "Default Title" ? item.variant.title : ""}
                            </div>
                          )}
                          {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price, order.currencyCode)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price * item.quantity, order.currencyCode)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-end pt-0">
              <div className="w-full md:w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotalPrice, order.currencyCode)}</span>
                </div>

                {order.totalShippingPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>{formatCurrency(order.totalShippingPrice, order.currencyCode)}</span>
                  </div>
                )}

                {order.totalDiscounts > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuentos</span>
                    <span>-{formatCurrency(order.totalDiscounts, order.currencyCode)}</span>
                  </div>
                )}

                {order.totalTax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Impuestos</span>
                    <span>{formatCurrency(order.totalTax, order.currencyCode)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalPrice, order.currencyCode)}</span>
                </div>

                <div className="flex justify-end">{getPaymentStatusBadge(order.financialStatus || "pending")}</div>
              </div>
            </CardFooter>
          </Card>

          {/* Notas y etiquetas */}
          {(order.note || (order.tags && order.tags.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Notas y etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                {order.note && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-1">Nota del cliente:</h3>
                    <p className="text-muted-foreground">{order.note}</p>
                  </div>
                )}

                {order.tags && order.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-1">Etiquetas:</h3>
                    <div className="flex flex-wrap gap-1">
                      {order.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <>
                  <div className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </div>
                  {order.customer.email && <div className="text-sm text-muted-foreground">{order.customer.email}</div>}
                  {order.customer.phone && <div className="text-sm text-muted-foreground">{order.customer.phone}</div>}

                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2"
                    onClick={() => router.push(`/dashboard/customers/${order.customer.id}`)}
                  >
                    Ver perfil del cliente
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">Cliente no registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Dirección de envío */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Dirección de envío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </div>
                  {order.shippingAddress.address1 && <div className="text-sm">{order.shippingAddress.address1}</div>}
                  {order.shippingAddress.address2 && <div className="text-sm">{order.shippingAddress.address2}</div>}
                  <div className="text-sm">
                    {order.shippingAddress.zip}, {order.shippingAddress.city}
                  </div>
                  {order.shippingAddress.province && <div className="text-sm">{order.shippingAddress.province}</div>}
                  <div className="text-sm">{order.shippingAddress.country}</div>
                  {order.shippingAddress.phone && <div className="text-sm">{order.shippingAddress.phone}</div>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dirección de facturación */}
          {order.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Dirección de facturación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-medium">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </div>
                  {order.billingAddress.address1 && <div className="text-sm">{order.billingAddress.address1}</div>}
                  {order.billingAddress.address2 && <div className="text-sm">{order.billingAddress.address2}</div>}
                  <div className="text-sm">
                    {order.billingAddress.zip}, {order.billingAddress.city}
                  </div>
                  {order.billingAddress.province && <div className="text-sm">{order.billingAddress.province}</div>}
                  <div className="text-sm">{order.billingAddress.country}</div>
                  {order.billingAddress.phone && <div className="text-sm">{order.billingAddress.phone}</div>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
