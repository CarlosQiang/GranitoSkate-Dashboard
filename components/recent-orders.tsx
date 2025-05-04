"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchRecentOrders } from "@/lib/api/orders"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Order {
  id: string
  name: string
  processedAt: string
  fulfillmentStatus: string
  financialStatus: string
  totalPrice: string
  customer: {
    firstName: string
    lastName: string
  }
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRecentOrders(5)
      setOrders(data)
    } catch (err) {
      console.error("Error fetching recent orders:", err)
      setError((err as Error).message || "Error desconocido al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Pedidos recientes</CardTitle>
        <Button variant="ghost" size="sm" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando pedidos...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-md">
            <p className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
            <Button variant="outline" size="sm" onClick={loadOrders} className="mt-2 w-full sm:w-auto">
              Reintentar
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-gray-50 transition-colors gap-2 sm:gap-0"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm sm:text-base">{order.name}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <p className="text-muted-foreground">{formatDate(order.processedAt)}</p>
                    <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <Badge className={`${getStatusColor(order.fulfillmentStatus)} text-xs`}>
                    {order.fulfillmentStatus.replace("_", " ")}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hover:bg-primary/10 hover:text-primary p-1 sm:p-2"
                  >
                    <Link href={`/dashboard/orders/${order.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
