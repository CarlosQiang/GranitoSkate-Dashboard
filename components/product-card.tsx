import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  // Extraer datos de forma segura
  const id = product.shopify_id || product.id || "unknown"
  const title = product.title || "Sin título"
  const price = product.price || product.variants?.[0]?.price || 0
  const compareAtPrice = product.compare_at_price || product.variants?.[0]?.compareAtPrice
  const imageUrl =
    product.featured_image || product.featuredImage?.url || product.images?.[0]?.url || "/placeholder.svg"
  const status = product.status || "DRAFT"
  const productType = product.product_type || product.productType || ""

  return (
    <Link href={`/dashboard/products/${id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <CardContent className="p-0">
          <div className="aspect-square bg-gray-100 relative">
            {/* Imagen del producto */}
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />

            {/* Indicador de estado */}
            {status !== "ACTIVE" && (
              <div className="absolute top-2 right-2">
                <Badge variant={status === "DRAFT" ? "outline" : "secondary"}>
                  {status === "DRAFT" ? "Borrador" : status}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{title}</h3>

            {productType && <p className="text-sm text-gray-500 mt-1">{productType}</p>}

            <div className="mt-2 flex items-center gap-2">
              <span className="font-semibold">{formatCurrency(price)}</span>

              {compareAtPrice && compareAtPrice > price && (
                <span className="text-sm text-gray-500 line-through">{formatCurrency(compareAtPrice)}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
