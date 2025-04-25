import { CollectionForm } from "@/components/collections/collection-form"

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Colección</h1>
        <p className="text-muted-foreground">Crea una nueva colección en tu tienda Shopify</p>
      </div>

      <CollectionForm />
    </div>
  )
}
