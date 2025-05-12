import { fetchRecentProducts } from "@/lib/api/products"
import Link from "next/link"

export async function RecentProducts() {
  try {
    const products = await fetchRecentProducts(5)

    if (!products || products.length === 0) {
      return <div className="text-center text-muted-foreground">No hay productos recientes</div>
    }

    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center">
            <div className="mr-4 h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              {product.featuredImage ? (
                <img
                  src={product.featuredImage.url || "/placeholder.svg"}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  No img
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Link href={`/dashboard/products/${product.id}`} className="font-medium hover:underline">
                {product.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {product.price} € · {product.inventoryQuantity} en stock
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error loading recent products:", error)
    return <div className="text-center text-destructive">Error al cargar productos recientes</div>
  }
}
