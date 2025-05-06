"use client"

import { useState, useEffect } from "react"
import { fetchCustomerById } from "@/lib/api/customers"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface CustomerOrdersListProps {
  customerId: string
}

export function CustomerOrdersList({ customerId }: CustomerOrdersListProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const customer = await fetchCustomerById(customerId)
        if (customer && customer.orders && customer.orders.edges) {
          const ordersList = customer.orders.edges.map((edge: any) => edge.node)
          setOrders(ordersList)
        } else {
          setOrders([])
        }
      } catch (err) {
        console.error("Error loading customer orders:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar los pedidos")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [customerId])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchCustomerById(customerId)
      .then((customer) => {
        if (customer && customer.orders && customer.orders.edges) {
          const ordersList = customer.orders.edges.map((edge: any) => edge.node)
          setOrders(ordersList)
        } else {
          setOrders([])
        }
      })
      .catch((err) => {
        console.error("Error retrying to load customer orders:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar los pedidos")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fulfilled":
        return "success"
      case "unfulfilled":
        return "warning"
      case "partially_fulfilled":
        return "warning"
      case "paid":
        return "success"
      case "pending":
        return "warning"
      case "refunded":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos del cliente</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar los pedidos</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Este cliente aún no ha realizado ningún pedido.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.name}</TableCell>
                  <TableCell>{formatDate(order.processedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={getStatusColor(order.fulfillmentStatus)}>
                        {order.fulfillmentStatus || "Pendiente"}
                      </Badge>
                      <Badge variant={getStatusColor(order.financialStatus)} className="mt-1">
                        {order.financialStatus || "Pendiente"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalPrice?.amount, order.totalPrice?.currencyCode)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Ver detalles
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
