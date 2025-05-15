import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/loading-state"
import { ProductsList } from "@/components/products-list"
import { RefreshCw } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-muted-foreground">Gestiona los productos de tu tienda</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/productos/sincronizacion">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar con Shopify
            </Link>
          </Button>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingState message="Cargando productos..." />}>
        <ProductsList />
      </Suspense>
    </div>
  )
}
