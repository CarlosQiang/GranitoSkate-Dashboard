"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { fetchCustomerById } from "@/lib/api/customers"
import { Eye } from "lucide-react"

interface CustomerOrdersListProps {
  customerId: string
}

export function CustomerOrdersList({ customerId }: CustomerOrdersListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const customer = await fetchCustomerById(customerId)
        if (customer && customer.orders && customer.orders.edges) {
          setOrders(customer.orders.edges.map((edge: any) => edge.node))
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [customerId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Este cliente no tiene pedidos.</p>
      </div>
    )
  }

  // Función para obtener la clase de color según el estado
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      case "FULFILLED":
        return "bg-green-100 text-green-800"
      case "UNFULFILLED":
        return "bg-yellow-100 text-yellow-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <div className="font-medium">{order.name}</div>
                <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                <div className="flex gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      order.displayFinancialStatus,
                    )}`}
                  >
                    {order.displayFinancialStatus}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      order.displayFulfillmentStatus,
                    )}`}
                  >
                    {order.displayFulfillmentStatus}
                  </span>
                </div>
                <div className="font-medium">{formatCurrency(order.totalPriceSet.shopMoney.amount)}</div>
                <Button asChild size="sm" variant="outline" className="ml-0 sm:ml-2 mt-2 sm:mt-0">
                  <Link href={`/dashboard/orders/${order.id.split("/").pop()}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
