"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, ShoppingCart } from "lucide-react"
import { fetchRecentOrders } from "@/lib/api/orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Cambiamos la exportación para que coincida con la importación en dashboard/page.tsx
export function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRecentOrders(5)
      setOrders(data)
    } catch (err) {
      console.error("Error al cargar pedidos recientes:", err)
      setError(err.message || "Error al cargar pedidos recientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-100 text-yellow-800">Pago parcial</Badge>
      case "PENDING":
        return <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>
      case "REFUNDED":
        return <Badge className="bg-red-100 text-red-800">Reembolsado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFulfillmentBadge = (status) => {
    switch (status) {
      case "FULFILLED":
        return <Badge className="bg-green-100 text-green-800">Enviado</Badge>
      case "PARTIALLY_FULFILLED":
        return <Badge className="bg-yellow-100 text-yellow-800">Enviado parcial</Badge>
      case "UNFULFILLED":
        return <Badge className="bg-gray-100 text-gray-800">Sin enviar</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Los últimos 5 pedidos recibidos</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay pedidos recientes</p>
            <p className="text-muted-foreground max-w-md">
              Todavía no se han recibido pedidos en tu tienda. Cuando recibas pedidos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col space-y-2 p-3 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {getStatusBadge(order.status)}
                    {getFulfillmentBadge(order.fulfillmentStatus)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {order.customer ? (
                      <span>
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Cliente anónimo</span>
                    )}
                  </div>
                  <div className="font-medium">{formatCurrency(order.total.amount, order.total.currencyCode)}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                >
                  Ver detalles
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/orders")}>
          Ver todos los pedidos
        </Button>
      </CardFooter>
    </Card>
  )
}

// Añadimos una exportación por defecto para mantener compatibilidad
export default RecentOrders
