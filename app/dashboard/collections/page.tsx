import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"
import { CollectionsList } from "@/components/collections-list"
import { SyncCollectionsOnly } from "@/components/sync-collections-only"

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
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva colección
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingState message="Cargando colecciones..." />}>
        <CollectionsList />
      </Suspense>

      {/* Componente de reemplazo de colecciones al final */}
      <div className="mt-8">
        <SyncCollectionsOnly onSyncComplete={() => {}} />
      </div>
    </div>
  )
}
