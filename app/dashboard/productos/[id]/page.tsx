import { Suspense } from "react"
import { ProductForm } from "@/components/products/product-form"
import { ProductFormSkeleton } from "@/components/products/product-form-skeleton"

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
        <p className="text-muted-foreground">Actualiza la información del producto</p>
      </div>

      <Suspense fallback={<ProductFormSkeleton />}>
        <ProductForm productId={params.id} />
      </Suspense>
    </div>
  )
}
