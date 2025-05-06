import { Suspense } from "react"
import { LoadingState } from "@/components/loading-state"
import { CollectionsList } from "@/components/collections-list"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function CollectionsPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Colecciones</h1>
          <p className="text-muted-foreground">Gestiona las colecciones de tu tienda</p>
        </div>
      </div>

      <Suspense fallback={<LoadingState message="Cargando colecciones..." />}>
        <CollectionsList />
      </Suspense>
    </div>
  )
}
