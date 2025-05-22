import type { Metadata } from "next"
import { CollectionsList } from "@/components/collections-list"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Colecciones | GestionGranito",
  description: "Gestiona las colecciones de tu tienda Shopify",
}

export default function CollectionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
          <p className="text-muted-foreground">Gestiona las colecciones de tu tienda Shopify</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/api/sync/colecciones" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar colecciones
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/collections/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva colección
            </Link>
          </Button>
        </div>
      </div>

      <CollectionsList />
    </div>
  )
}
