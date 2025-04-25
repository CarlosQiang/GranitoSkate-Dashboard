import { Suspense } from "react"
import { CustomersTable } from "@/components/customers/customers-table"
import { CustomersTableSkeleton } from "@/components/customers/customers-table-skeleton"
import { CustomersHeader } from "@/components/customers/customers-header"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <CustomersHeader />
      <Suspense fallback={<CustomersTableSkeleton />}>
        <CustomersTable />
      </Suspense>
    </div>
  )
}
