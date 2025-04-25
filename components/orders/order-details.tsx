"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getOrderById } from "@/lib/actions"

interface OrderDetailsProps {
  orderId: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<any | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true)
        const data = await getOrderById(orderId)
        setOrder(data)
      } catch (error) {
        console.error("Error al cargar el pedido:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del pedido",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, toast])

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-muted-foreground">No se encontró el pedido</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/pedidos")}>
          Volver a pedidos
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge>Pagado</Badge>
      case "REFUNDED":
        return <Badge variant="destructive">Reembolsado</Badge>
      case "FULFILLED":
        return <Badge variant="default">Enviado</Badge>
      case "UNFULFILLED":
        return <Badge variant="outline">Pendiente de envío</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedido {order.name}</h2>
          <p className="text-muted-foreground">{formatDate(order.processedAt)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild>
            <a
              href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/orders/${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver en Shopify
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {getStatusBadge(order.financialStatus)}
        {getStatusBadge(order.fulfillmentStatus || "UNFULFILLED")}
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Productos</TabsTrigger>
          <TabsTrigger value="customer">Cliente</TabsTrigger>
          <TabsTrigger value="shipping">Envío</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.lineItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex items-start gap-4">
                      {item.variant?.image ? (
                        <Image
                          src={item.variant.image.url || "/placeholder.svg"}
                          alt={item.title}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-[60px] w-[60px] rounded-md bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant.title !== "Default Title" ? item.variant.title : ""}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.variant?.sku || "N/A"} | Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.originalUnitPrice.amount, item.originalUnitPrice.currencyCode)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p>{formatCurrency(order.subtotalPrice.amount, order.subtotalPrice.currencyCode)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Envío</p>
                  <p>{formatCurrency(order.totalShippingPrice.amount, order.totalShippingPrice.currencyCode)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Impuestos</p>
                  <p>{formatCurrency(order.totalTax.amount, order.totalTax.currencyCode)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <p>Total</p>
                  <p>{formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.customer ? (
                <>
                  <div>
                    <p className="font-medium">
                      <Link href={`/dashboard/clientes/${order.customer.id}`} className="hover:underline">
                        {order.customer.firstName} {order.customer.lastName}
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    {order.customer.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Cliente no disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dirección de envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.shippingAddress ? (
                <>
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p className="text-sm">
                    {order.shippingAddress.address1}
                    {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                  </p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p className="text-sm">{order.shippingAddress.phone}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">No hay dirección de envío</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/dashboard/pedidos")}>
          Volver a pedidos
        </Button>
      </div>
    </div>
  )
}
