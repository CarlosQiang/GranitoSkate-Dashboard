import { Suspense } from "react"
import { ProductsHeader } from "@/components/products/products-header"
import { ProductsTable } from "@/components/products/products-table"
import { ProductsTableSkeleton } from "@/components/products/products-table-skeleton"

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
