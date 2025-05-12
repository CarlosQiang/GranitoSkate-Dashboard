"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertCircle, Eye } from "lucide-react"
import { fetchRecentOrders } from "@/lib/api/orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const loadOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecentOrders(5)
      setOrders(data)
    } catch (err) {
      console.error("Error al cargar pedidos recientes:", err)
      setError(err.message || "No se pudieron cargar los pedidos recientes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="outline">Desconocido</Badge>

    const statusMap = {
      PAID: { variant: "default", label: "Pagado" },
      PARTIALLY_PAID: { variant: "default", label: "Pago parcial" },
      PENDING: { variant: "secondary", label: "Pendiente" },
      REFUNDED: { variant: "destructive", label: "Reembolsado" },
      VOIDED: { variant: "destructive", label: "Anulado" },
      FULFILLED: { variant: "success", label: "Enviado" },
      PARTIALLY_FULFILLED: { variant: "warning", label: "Enviado parcial" },
      UNFULFILLED: { variant: "outline", label: "Pendiente de envío" },
    }

    const statusInfo = statusMap[status] || { variant: "outline", label: status }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Los últimos pedidos de tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pedidos recientes</span>
            <Button variant="outline" size="sm" onClick={loadOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 text-sm border rounded-md bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pedidos recientes</span>
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </CardTitle>
        <CardDescription>Los últimos pedidos de tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No hay pedidos recientes para mostrar</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Cliente no registrado"}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.processedAt)}</TableCell>
                  <TableCell>{getStatusBadge(order.displayFulfillmentStatus)}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice, order.currencyCode)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver pedido</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
