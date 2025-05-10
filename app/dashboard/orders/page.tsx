import { Suspense } from "react"
import Link from "next/link"
import { getOrders } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatShopifyPrice } from "@/lib/shopify"
import { RefreshCw, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

// Componente para cargar los pedidos
async function OrdersList() {
  try {
    const { orders } = await getOrders(10)

    if (!orders || orders.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No hay pedidos disponibles</p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.displayFinancialStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.displayFinancialStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.displayFinancialStatus}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.displayFulfillmentStatus === "FULFILLED"
                        ? "bg-green-100 text-green-800"
                        : order.displayFulfillmentStatus === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.displayFulfillmentStatus}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="text-sm">
                    {order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : "Cliente no registrado"}
                  </p>
                  {order.customer && <p className="text-sm text-muted-foreground">{order.customer.email}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-sm font-medium">{formatShopifyPrice(order.totalPriceSet.shopMoney.amount)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/orders/${order.id.split("/").pop()}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error al cargar la lista de pedidos:", error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error al cargar los pedidos. Por favor, inténtalo de nuevo.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    )
  }
}

// Componente de carga
function OrdersLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <Suspense fallback={<OrdersLoading />}>
        <OrdersList />
      </Suspense>
    </div>
  )
}
