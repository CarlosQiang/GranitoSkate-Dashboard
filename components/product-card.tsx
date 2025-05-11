import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Tag, Package } from "lucide-react"
import { formatCurrency, getImageUrl } from "@/lib/utils"

export function ProductCard({ product }) {
  if (!product) return null

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    DRAFT: "bg-gray-100 text-gray-800",
    ARCHIVED: "bg-red-100 text-red-800",
  }

  const statusText = {
    ACTIVE: "Activo",
    DRAFT: "Borrador",
    ARCHIVED: "Archivado",
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-gray-100">
        {product.featuredImage ? (
          <Image
            src={getImageUrl(product.featuredImage, "/placeholder.svg") || "/placeholder.svg"}
            alt={product.featuredImage.altText || product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Package size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className={`${statusColors[product.status] || "bg-gray-100 text-gray-800"}`}>
            {statusText[product.status] || product.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          {product.vendor && (
            <Badge variant="outline" className="text-xs">
              {product.vendor}
            </Badge>
          )}
          {product.productType && (
            <Badge variant="outline" className="text-xs">
              {product.productType}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "Sin descripción"}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCurrency(product.price, product.currencyCode)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through ml-1">
              {formatCurrency(product.compareAtPrice, product.currencyCode)}
            </span>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/products/${product.id}`}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
