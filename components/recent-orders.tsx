"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchRecentOrders } from "@/lib/api/orders"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const data = await fetchRecentOrders(5)
        setOrders(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar pedidos recientes:", err)
        setError("Error al cargar pedidos recientes")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return dateString
    }
  }

  const formatCurrency = (amount: string | number, currency = "EUR") => {
    try {
      const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
      // Asegurarse de que siempre haya un código de moneda válido
      const currencyCode = currency || "EUR"
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currencyCode,
      }).format(numAmount)
    } catch (error) {
      console.error("Error al formatear moneda:", error)
      return `${amount} €`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fulfilled":
      case "paid":
        return "text-green-600"
      case "unfulfilled":
      case "partially_fulfilled":
        return "text-amber-600"
      case "refunded":
        return "text-blue-600"
      case "pending":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[80px]" />
              <Skeleton className="h-5 w-[60px]" />
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
        <p className="text-center text-muted-foreground py-4">No hay pedidos recientes</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div>
                <Link href={`/dashboard/orders/${order.id}`} className="font-medium hover:underline">
                  {order.name}
                </Link>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(order.total, order.currency)}</p>
                <p className={`text-sm ${getStatusColor(order.status)}`}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
