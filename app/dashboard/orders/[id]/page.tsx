"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Printer, Download, Tag, Mail, Phone, MapPin } from "lucide-react"
import { fetchOrderById } from "@/lib/api/orders"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getOrder = async () => {
      try {
        setIsLoading(true)
        const data = await fetchOrderById(params.id)
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el pedido",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getOrder()
  }, [params.id, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "UNFULFILLED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "PARTIALLY_FULFILLED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "REFUNDED":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isLoading ? <Skeleton className="h-9 w-32" /> : `Pedido ${order?.name}`}
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? <Skeleton className="h-5 w-48 mt-1" /> : `Realizado el ${formatDate(order?.processedAt)}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Implementar exportación a PDF
              toast({
                title: "Exportando pedido",
                description: "El pedido se está exportando a PDF",
              })
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => router.push(`/dashboard/orders/${params.id}/edit`)}>
            <Tag className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Resumen del pedido</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={getStatusColor(order?.fulfillmentStatus)}>
                    {order?.fulfillmentStatus.replace("_", " ")}
                  </Badge>
                  <Badge className={getStatusColor(order?.financialStatus)}>
                    {order?.financialStatus.replace("_", " ")}
                  </Badge>
                  {order?.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
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
                    {order?.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order?.subtotalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{formatCurrency(order?.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos</span>
                    <span>{formatCurrency(order?.taxPrice)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order?.totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="shipping">
              <TabsList>
                <TabsTrigger value="shipping">Dirección de envío</TabsTrigger>
                <TabsTrigger value="billing">Dirección de facturación</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="shipping">
                <Card>
                  <CardHeader>
                    <CardTitle>Dirección de envío</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order?.shippingAddress ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p>{order.shippingAddress.address1}</p>
                            {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                        {order.shippingAddress.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.shippingAddress.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay dirección de envío disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Dirección de facturación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order?.billingAddress ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p>{order.billingAddress.address1}</p>
                            {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                            <p>
                              {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.zip}
                            </p>
                            <p>{order.billingAddress.country}</p>
                          </div>
                        </div>
                        {order.billingAddress.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.billingAddress.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay dirección de facturación disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Notas del pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order?.note ? (
                      <div className="p-4 bg-muted rounded-md">
                        <p>{order.note}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay notas para este pedido</p>
                    )}

                    {order?.customAttributes && order.customAttributes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Atributos personalizados</h4>
                        <div className="space-y-2">
                          {order.customAttributes.map((attr: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-medium">{attr.key}</span>
                              <span>{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                {order?.customer ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-lg">
                        {order.customer.firstName} {order.customer.lastName}
                      </h4>
                    </div>

                    {order.customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${order.customer.email}`} className="text-primary hover:underline">
                          {order.customer.email}
                        </a>
                      </div>
                    )}

                    {order.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${order.customer.phone}`} className="text-primary hover:underline">
                          {order.customer.phone}
                        </a>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/customers/${order.customer.id}`)}
                    >
                      Ver perfil del cliente
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay información del cliente disponible</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cronología</CardTitle>
                <CardDescription>Historial del pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium">Pedido creado</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order?.processedAt)}</p>
                    </div>
                  </div>

                  {order?.financialStatus === "PAID" && (
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="font-medium">Pago recibido</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order?.processedAt)}</p>
                      </div>
                    </div>
                  )}

                  {order?.fulfillmentStatus === "FULFILLED" && (
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="font-medium">Pedido enviado</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order?.processedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
