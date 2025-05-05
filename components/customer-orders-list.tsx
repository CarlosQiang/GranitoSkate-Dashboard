"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchCustomerById } from "@/lib/api/customers"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface CustomerOrdersListProps {
  customerId: string
}

export function CustomerOrdersList({ customerId }: CustomerOrdersListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getCustomerOrders = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCustomerById(customerId)
        setOrders(data.orders || [])
      } catch (error) {
        console.error("Error fetching customer orders:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos del cliente",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getCustomerOrders()
  }, [customerId, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">En progreso</Badge>
      case "PARTIALLY_FULFILLED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Parcialmente completado</Badge>
      case "UNFULFILLED":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pendiente</Badge>
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Parcialmente pagado</Badge>
      case "UNPAID":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">No pagado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado de envío</TableHead>
              <TableHead>Estado de pago</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Este cliente no tiene pedidos</div>
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado de envío</TableHead>
            <TableHead>Estado de pago</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.name}</TableCell>
              <TableCell>{formatDate(order.processedAt)}</TableCell>
              <TableCell>{getStatusBadge(order.fulfillmentStatus)}</TableCell>
              <TableCell>{getStatusBadge(order.financialStatus)}</TableCell>
              <TableCell>{formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver pedido
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
