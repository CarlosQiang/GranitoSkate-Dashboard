import { Suspense } from "react"
import { CollectionsTable } from "@/components/collections/collections-table"
import { CollectionsTableSkeleton } from "@/components/collections/collections-table-skeleton"
import { CollectionsHeader } from "@/components/collections/collections-header"

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <CollectionsHeader />
      <Suspense fallback={<CollectionsTableSkeleton />}>
        <CollectionsTable />
      </Suspense>
    </div>
  )
}
