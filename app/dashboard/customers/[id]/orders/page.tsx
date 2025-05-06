import { fetchCustomerById } from "@/lib/api/customers"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface OrdersPageProps {
  params: {
    id: string
  }
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const customer = await fetchCustomerById(params.id)
  const orders = customer.orders?.edges?.map((edge: any) => edge.node) || []

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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/customers/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Pedidos de {customer.firstName} {customer.lastName}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
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
                {orders.map((order: any) => (
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
    </div>
  )
}
