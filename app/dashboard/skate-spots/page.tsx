import { Suspense } from "react"
import { SkateSpotsHeader } from "@/components/skate-spots/skate-spots-header"
import { SkateSpotsGrid } from "@/components/skate-spots/skate-spots-grid"
import { SkateSpotsGridSkeleton } from "@/components/skate-spots/skate-spots-grid-skeleton"

export default function SkateSpotsPage() {
  return (
    <div className="space-y-6">
      <SkateSpotsHeader />
      <Suspense fallback={<SkateSpotsGridSkeleton />}>
        <SkateSpotsGrid />
      </Suspense>
    </div>
  )
}
