import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, getImageUrl } from "@/lib/utils"
import { extractIdFromGid } from "@/lib/shopify"
import { Package, Tag, Edit, Eye } from "lucide-react"

export function ProductCard({ product }) {
  // Extraer el ID numérico para la URL
  const productId = extractIdFromGid(product.id) || product.id

  // Determinar el estado del producto
  const getStatusBadge = () => {
    switch (product.status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Activo</Badge>
      case "DRAFT":
        return <Badge variant="outline">Borrador</Badge>
      case "ARCHIVED":
        return <Badge variant="secondary">Archivado</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] relative bg-gray-100">
        {product.image ? (
          <Image
            src={getImageUrl(product.image.url) || "/placeholder.svg?height=300&width=400&query=product"}
            alt={product.image.altText || product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">{formatCurrency(product.price, "EUR")}</span>
            <span className="text-sm text-muted-foreground">{product.vendor}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {product.productType && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {product.productType}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/dashboard/products/${productId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <a
            href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/products/${product.handle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
