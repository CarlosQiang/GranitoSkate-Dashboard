import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, RefreshCw, Package } from "lucide-react"

export function ProductCard({ product }) {
  if (!product) return null

  // Normalizar los datos del producto (puede venir de Shopify o de la base de datos)
  const title = product.titulo || product.title || "Producto sin título"
  const status = (product.estado || product.status || "active").toLowerCase()
  const price = product.precio || product.price || 0
  const compareAtPrice = product.precio_comparacion || product.compareAtPrice || null
  const inventory = product.inventario || product.inventory || 0
  const imageUrl = product.imagen_url || product.image || null
  const id = product.id || product.shopify_id || ""

  // Formatear el precio
  const formattedPrice = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price))

  // Determinar el color del badge según el estado
  const getBadgeVariant = (status) => {
    if (status === "active") return "success"
    if (status === "draft") return "secondary"
    if (status === "archived") return "destructive"
    return "outline"
  }

  // Traducir el estado
  const getStatusText = (status) => {
    if (status === "active") return "Activo"
    if (status === "draft") return "Borrador"
    if (status === "archived") return "Archivado"
    return status
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <Badge variant={getBadgeVariant(status)} className="absolute top-2 right-2">
          {getStatusText(status)}
        </Badge>
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        <div className="mt-2 text-lg font-bold">{formattedPrice}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {inventory > 0 ? `${inventory} en stock` : "Sin stock"}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/dashboard/products/${id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/api/sync/productos/${id}`}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
