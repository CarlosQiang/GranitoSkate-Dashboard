import { fetchRecentOrders } from "@/lib/api/orders"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function RecentOrders() {
  try {
    const orders = await fetchRecentOrders(5)

    if (!orders || orders.length === 0) {
      return <div className="text-center text-muted-foreground">No hay pedidos recientes</div>
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center">
            <div className="space-y-1 flex-1">
              <Link href={`/dashboard/orders/${order.id}`} className="font-medium hover:underline">
                {order.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {order.totalPrice} € · {formatDistanceToNow(new Date(order.createdAt), { locale: es, addSuffix: true })}
              </p>
            </div>
            <div className="ml-auto">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  order.fulfillmentStatus === "FULFILLED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.fulfillmentStatus === "FULFILLED" ? "Enviado" : "Pendiente"}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error loading recent orders:", error)
    return <div className="text-center text-destructive">Error al cargar pedidos recientes</div>
  }
}
