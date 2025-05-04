import { Suspense } from "react"
import { LoadingState } from "@/components/loading-state"
import { ProductsList } from "@/components/products-list"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona los productos de tu tienda</p>
        </div>
      </div>

      <Suspense fallback={<LoadingState message="Cargando productos..." />}>
        <ProductsList />
      </Suspense>
    </div>
  )
}
