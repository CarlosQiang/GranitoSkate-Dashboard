"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentOrders } from "@/lib/api/orders"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ShoppingBag, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRecentOrders(5)
      setOrders(data)
    } catch (err) {
      console.error("Error al cargar pedidos recientes:", err)
      setError(err.message || "No se pudieron cargar los pedidos recientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { label: "Pagado", variant: "success" },
      PARTIALLY_PAID: { label: "Pago parcial", variant: "warning" },
      PENDING: { label: "Pendiente", variant: "warning" },
      REFUNDED: { label: "Reembolsado", variant: "secondary" },
      UNPAID: { label: "Sin pagar", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={loadOrders}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay pedidos recientes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pedidos recientes</CardTitle>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.date)} · {order.customer?.firstName} {order.customer?.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <span className="font-medium">{formatCurrency(order.total.amount, order.total.currencyCode)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/orders">Ver todos los pedidos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Exportación por defecto para compatibilidad
export default RecentOrders
