import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Tag, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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

  // Función segura para obtener la URL de la imagen
  const getImageUrl = (image) => {
    if (!image) return null

    // Si image es un objeto con propiedad url
    if (typeof image === "object" && image.url) {
      const url = image.url
      if (typeof url === "string") {
        return url.startsWith("http") ? url : `https:${url}`
      }
    }

    // Si image es directamente una string (url)
    if (typeof image === "string") {
      return image.startsWith("http") ? image : `https:${image}`
    }

    return null
  }

  // Obtener la URL de la imagen de manera segura
  const imageUrl = product.featuredImage ? getImageUrl(product.featuredImage) : null

  // Extraer el ID numérico del producto para la URL
  const getNumericId = (id) => {
    if (!id) return ""
    // Si el ID ya es numérico, devolverlo directamente
    if (/^\d+$/.test(id)) return id
    // Si tiene formato gid://shopify/Product/123456789, extraer solo el número
    const match = id.match(/\/Product\/(\d+)$/)
    return match ? match[1] : id
  }

  const productId = getNumericId(product.id)

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.featuredImage?.altText || product.title || "Producto"}
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
            {statusText[product.status] || product.status || "Desconocido"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.title || "Sin título"}</h3>
        <div className="flex flex-wrap items-center gap-2 mb-2">
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
          {/* Mostrar las colecciones reales del producto */}
          {product.collections &&
            product.collections.edges &&
            product.collections.edges.map((edge) => (
              <Badge key={edge.node.id} variant="secondary" className="text-xs">
                {edge.node.title}
              </Badge>
            ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "Sin descripción"}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCurrency(product.price || 0, product.currencyCode || "EUR")}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through ml-1">
              {formatCurrency(product.compareAtPrice, product.currencyCode || "EUR")}
            </span>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/products/${productId}`}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
