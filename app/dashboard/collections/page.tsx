import { Suspense } from "react"
import Link from "next/link"
import { getCollections } from "@/lib/api/collections"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, RefreshCw } from "lucide-react"

// Componente para cargar las colecciones
async function CollectionsList() {
  const { collections } = await getCollections(10)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card key={collection.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="aspect-video w-full overflow-hidden">
              {collection.image ? (
                <img
                  src={collection.image.url || "/placeholder.svg"}
                  alt={collection.image.altText || collection.title}
                  className="h-full w-full object-cover transition-all hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground">Sin imagen</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="line-clamp-1 text-lg">{collection.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2 h-10">{collection.description}</CardDescription>
            <div className="mt-4 flex items-center justify-end">
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/collections/${collection.id.split("/").pop()}`}>Ver detalles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente de carga
function CollectionsLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="aspect-video w-full" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-10 w-full" />
            <div className="mt-4 flex items-center justify-end">
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button asChild>
            <Link href="/dashboard/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Colección
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<CollectionsLoading />}>
        <CollectionsList />
      </Suspense>
    </div>
  )
}
