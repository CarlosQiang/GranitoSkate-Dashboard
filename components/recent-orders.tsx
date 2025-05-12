"use client"

import { useState, useEffect } from "react"
import { fetchRecentOrders } from "@/lib/api/orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const loadOrders = async () => {
    try {
      setIsRefreshing(true)
      const data = await fetchRecentOrders(5)
      setOrders(data)
      setError(null)
    } catch (err) {
      console.error("Error loading recent orders:", err)
      setError("No se pudieron cargar los pedidos recientes")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Los últimos 5 pedidos de tu tienda</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={loadOrders} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <Skeleton className="h-4 w-[100px] mb-1" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <Skeleton className="h-6 w-[70px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-muted-foreground">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadOrders} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <p>No hay pedidos recientes</p>
          </div>
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
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Cliente no registrado"}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.processedAt)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
                      {order.displayFulfillmentStatus || "PENDIENTE"}
                    </Badge>
                  </TableCell>
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
