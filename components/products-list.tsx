import { getProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"

export async function ProductsList({ limit = 50 }) {
  try {
    const products = await getProducts(limit)

    if (!products || products.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No hay productos disponibles.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error al cargar productos:", error)
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>
      </div>
    )
  }
}
