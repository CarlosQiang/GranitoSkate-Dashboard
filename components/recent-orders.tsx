"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, RefreshCw, AlertCircle } from "lucide-react"
import { fetchRecentOrders } from "@/lib/api/orders"
import { formatDate } from "@/lib/utils"

export function RecentOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchRecentOrders(5)
      setOrders(data)
    } catch (error) {
      console.error("Error loading recent orders:", error)
      setError(error.message || "Error al cargar pedidos recientes")
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="mb-4 text-destructive">{error}</p>
        <Button size="sm" onClick={loadOrders}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">No hay pedidos recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">{order.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{formatDate(order.processedAt)}</span>
              {order.customer && (
                <span className="ml-2">
                  • {order.customer.firstName} {order.customer.lastName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
              {order.displayFulfillmentStatus || "PENDIENTE"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalles</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
