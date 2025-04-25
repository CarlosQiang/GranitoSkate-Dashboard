import { Suspense } from "react"
import { SkateSpotDetails } from "@/components/skate-spots/skate-spot-details"
import { SkateSpotDetailsSkeleton } from "@/components/skate-spots/skate-spot-details-skeleton"

export default function SkateSpotPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalles del Skate Spot</h1>
        <p className="text-muted-foreground">Información detallada del spot de skate</p>
      </div>

      <Suspense fallback={<SkateSpotDetailsSkeleton />}>
        <SkateSpotDetails spotId={params.id} />
      </Suspense>
    </div>
  )
}
