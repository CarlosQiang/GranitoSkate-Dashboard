import { Suspense } from "react"
import { CollectionsList } from "@/components/collections-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { LoadingState } from "@/components/loading-state"

export const metadata = {
  title: "Colecciones | GestionGranito",
  description: "Gestiona las colecciones de tu tienda",
}

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
          <p className="text-muted-foreground">Gestiona las colecciones de tu tienda</p>
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
    </div>
  )
}
