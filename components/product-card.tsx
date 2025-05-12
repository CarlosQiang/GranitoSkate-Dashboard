import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Tag } from "lucide-react"
import Image from "next/image"

export function ProductCard({ product }) {
  // Determinar si la imagen es una URL relativa (datos de muestra) o una URL completa
  const imageUrl = product.image?.url?.startsWith("/")
    ? product.image.url
    : product.image?.url || "/diverse-products-still-life.png"

  // Formatear el precio
  const formattedPrice = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number.parseFloat(product.price))

  // Determinar el color del badge según el estado
  const statusColor = {
    ACTIVE: "bg-green-100 text-green-800 hover:bg-green-200",
    DRAFT: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    ARCHIVED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  // Obtener el ID numérico del producto
  const productId = product.id.split("/").pop()

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={product.image?.altText || product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
          <Badge className={statusColor[product.status] || "bg-gray-100"}>
            {product.status === "ACTIVE" ? "Activo" : product.status === "DRAFT" ? "Borrador" : "Archivado"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{product.description || "Sin descripción"}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {product.productType && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {product.productType}
            </Badge>
          )}
        </div>
        <p className="font-bold text-lg">{formattedPrice}</p>
        <p className="text-sm text-muted-foreground">
          {product.inventoryQuantity} en stock
          {!product.availableForSale && " • No disponible"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/products/${productId}`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/products/${productId}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
