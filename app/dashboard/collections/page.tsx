import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"
import { CollectionsList } from "@/components/collections-list"
import { SyncCollectionsOnly } from "@/components/sync-collections-only"

export const dynamic = "force-dynamic"
export const revalidate = 60

export default function CollectionsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Colecciones</h2>
          <p className="text-sm text-muted-foreground">Gestiona las colecciones de tu tienda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva colección
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingState message="Cargando colecciones..." />}>
        <CollectionsList />
      </Suspense>

      <div className="border-t pt-6">
        <SyncCollectionsOnly />
      </div>
    </div>
  )
}
