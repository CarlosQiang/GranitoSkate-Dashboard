import { Suspense } from "react"
import Link from "next/link"
import { getProducts } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatShopifyPrice } from "@/lib/shopify"
import { Plus, RefreshCw } from "lucide-react"

// Componente para cargar los productos
async function ProductsList() {
  const { products } = await getProducts(10)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="aspect-video w-full overflow-hidden">
              {product.images.edges.length > 0 ? (
                <img
                  src={product.images.edges[0].node.url || "/placeholder.svg"}
                  alt={product.images.edges[0].node.altText || product.title}
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
            <CardTitle className="line-clamp-1 text-lg">{product.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2 h-10">{product.description}</CardDescription>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium">{formatShopifyPrice(product.priceRange.minVariantPrice.amount)}</span>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/products/${product.id.split("/").pop()}`}>Ver detalles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente de carga
function ProductsLoading() {
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
            <div className="mt-4 flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<ProductsLoading />}>
        <ProductsList />
      </Suspense>
    </div>
  )
}
