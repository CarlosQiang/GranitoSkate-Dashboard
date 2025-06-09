import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"
import { CollectionsList } from "@/components/collections-list"
import { SyncCollectionsOnly } from "@/components/sync-collections-only"

// Cambiamos la configuración de revalidación para evitar conflictos
export const dynamic = "force-dynamic"
export const revalidate = 60 // Cambiamos a un valor numérico en segundos en lugar de 0

export default function CollectionsPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Colecciones</h1>
              <p className="text-muted-foreground">Gestiona las colecciones de tu tienda</p>
            </div>
            <Button asChild className="w-full sm:w-auto self-start">
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
          <div className="w-full border-t pt-8">
            <SyncCollectionsOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
