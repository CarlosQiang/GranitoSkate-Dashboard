import { Suspense } from "react"
import { OrderDetails } from "@/components/orders/order-details"
import { OrderDetailsSkeleton } from "@/components/orders/order-details-skeleton"

export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalles del Pedido</h1>
        <p className="text-muted-foreground">Información detallada del pedido</p>
      </div>

      <Suspense fallback={<OrderDetailsSkeleton />}>
        <OrderDetails orderId={params.id} />
      </Suspense>
    </div>
  )
}
