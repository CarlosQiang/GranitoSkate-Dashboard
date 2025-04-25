import { Suspense } from "react"
import { CollectionForm } from "@/components/collections/collection-form"
import { CollectionFormSkeleton } from "@/components/collections/collection-form-skeleton"

export default function CollectionPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Colección</h1>
        <p className="text-muted-foreground">Actualiza la información de la colección</p>
      </div>

      <Suspense fallback={<CollectionFormSkeleton />}>
        <CollectionForm collectionId={params.id} />
      </Suspense>
    </div>
  )
}
