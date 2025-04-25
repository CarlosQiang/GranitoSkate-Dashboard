import { Suspense } from "react"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrdersTableSkeleton } from "@/components/orders/orders-table-skeleton"
import { OrdersHeader } from "@/components/orders/orders-header"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <OrdersHeader />
      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTable />
      </Suspense>
    </div>
  )
}
