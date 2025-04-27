"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentOrders } from "@/lib/api/orders"
import { formatDate, formatCurrency } from "@/lib/utils"
import { AlertCircle, RefreshCw, Eye, ShoppingCart } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecentOrders(5)
      setOrders(data)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError((err as Error).message || "Error desconocido al cargar pedidos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
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
    <Card className="border-granito/20 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-granito to-granito-light text-white p-3 sm:p-4">
        <div>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Pedidos recientes
          </CardTitle>
          <CardDescription className="text-white/80 text-xs sm:text-sm">
            Los últimos 5 pedidos realizados en tu tienda
          </CardDescription>
        </div>
        {!isLoading && (
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchOrders}
            disabled={isLoading}
            className="bg-white text-granito hover:bg-gray-100 mt-2 sm:mt-0 w-full sm:w-auto"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Actualizar
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                  <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                  <Skeleton className="h-6 sm:h-8 w-6 sm:w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-md">
            <p className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="mt-2 w-full sm:w-auto">
              Reintentar
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <ShoppingCart className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground text-sm">No hay pedidos recientes</p>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="mt-4">
              Actualizar datos
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
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
                    className="hover:bg-granito/10 hover:text-granito p-1 sm:p-2"
                  >
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
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
