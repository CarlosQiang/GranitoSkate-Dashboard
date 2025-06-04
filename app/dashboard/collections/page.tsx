"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"
import { CollectionsList } from "@/components/collections-list"
import { SyncCollectionsOnly } from "@/components/sync-collections-only"
import { ErrorBoundary } from "react-error-boundary"

export const dynamic = "force-dynamic"
export const revalidate = 0

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 mb-2">Error en la página de colecciones</h2>
      <p className="text-red-700 mb-4">{error.message || "Ha ocurrido un error inesperado"}</p>
      <Button onClick={resetErrorBoundary}>Intentar de nuevo</Button>
    </div>
  )
}

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

      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Suspense fallback={<LoadingState message="Cargando colecciones..." />}>
          <CollectionsList />
        </Suspense>
      </ErrorBoundary>

      {/* Componente de reemplazo de colecciones al final */}
      <div className="mt-8 border-t pt-8">
        <SyncCollectionsOnly onSyncComplete={() => window.location.reload()} />
      </div>
    </div>
  )
}
