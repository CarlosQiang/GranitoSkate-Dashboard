import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  // Extraer datos del producto con manejo de diferentes formatos
  const id = product.id || product.shopify_id
  const title = product.titulo || product.title || "Sin título"
  const status = product.estado || product.status || "draft"

  // Manejar diferentes formatos de imagen
  let imageUrl = null
  if (product.imagen_url) {
    imageUrl = product.imagen_url
  } else if (product.featuredImage && product.featuredImage.url) {
    imageUrl = product.featuredImage.url
  } else if (product.image && product.image.url) {
    imageUrl = product.image.url
  }

  // Manejar diferentes formatos de precio
  let price = null
  if (product.precio !== undefined) {
    price = product.precio
  } else if (product.variants && product.variants.edges && product.variants.edges[0]) {
    price = product.variants.edges[0].node.price
  } else if (product.price !== undefined) {
    price = product.price
  }

  // Formatear precio
  const formattedPrice =
    price !== null
      ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(price)
      : "Precio no disponible"

  // Determinar color de badge según estado
  const getBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "active") return "success"
    if (statusLower === "draft") return "secondary"
    if (statusLower === "archived") return "destructive"
    return "outline"
  }

  // Formatear estado para mostrar
  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "active") return "Activo"
    if (statusLower === "draft") return "Borrador"
    if (statusLower === "archived") return "Archivado"
    return status
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <Tag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate flex-1" title={title}>
            {title}
          </h3>
          <Badge variant={getBadgeVariant(status) as any} className="ml-2">
            {getStatusText(status)}
          </Badge>
        </div>
        <p className="text-lg font-semibold">{formattedPrice}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/products/${id}`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/products/${id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
