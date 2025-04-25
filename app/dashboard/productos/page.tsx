import { Suspense } from "react"
import { ProductsTable } from "@/components/products/products-table"
import { ProductsTableSkeleton } from "@/components/products/products-table-skeleton"
import { ProductsHeader } from "@/components/products/products-header"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductsHeader />
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable />
      </Suspense>
    </div>
  )
}
