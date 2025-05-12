import { fetchCustomerOrders } from "@/lib/api/orders"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

export default async function CustomerOrdersPage({ params }) {
  const { id } = params

  try {
    const orders = await fetchCustomerOrders(id)

    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos del cliente</CardTitle>
          <CardDescription>Historial de pedidos realizados por este cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Este cliente no tiene pedidos</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{order.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.processedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={order.displayFulfillmentStatus === "FULFILLED" ? "bg-green-500" : "bg-yellow-500"}
                    >
                      {order.displayFulfillmentStatus === "FULFILLED" ? "Enviado" : "Pendiente"}
                    </Badge>
                    <Badge variant="outline">{order.totalPrice} €</Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
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
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No se pudieron cargar los pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error.message}</p>
        </CardContent>
      </Card>
    )
  }
}
