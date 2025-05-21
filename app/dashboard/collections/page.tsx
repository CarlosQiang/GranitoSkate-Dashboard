import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"
import { CollectionsList } from "@/components/collections-list"
import type { Metadata } from "next"
import { SyncButton } from "@/components/sync-button"

export const metadata: Metadata = {
  title: "Colecciones | GestionGranito",
  description: "Gestiona las colecciones de tu tienda Shopify",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CollectionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
          <p className="text-muted-foreground">Gestiona las colecciones de tu tienda Shopify</p>
        </div>
        <div className="flex gap-2">
          <SyncButton entityType="colecciones" label="Sincronizar colecciones" variant="outline" />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva colección
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<LoadingState message="Cargando colecciones..." />}>
        <CollectionsList />
      </Suspense>
    </div>
  )
}
