import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SyncButton } from "@/components/sync-button"
import { Eye, Tag, Package, AlertCircle } from "lucide-react"

interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  // Normalizar los datos del producto (puede venir de Shopify o de la base de datos)
  const title = product.titulo || product.title || "Producto sin título"
  const status = product.estado || product.status || "active"
  const price = product.precio || product.variants?.edges?.[0]?.node?.price || 0
  const compareAtPrice = product.precio_comparacion || product.variants?.edges?.[0]?.node?.compareAtPrice || null
  const inventory = product.inventario || product.variants?.edges?.[0]?.node?.inventoryQuantity || 0
  const imageUrl = product.imagen_url || product.featuredImage?.url || "/generic-product-display.png"
  const productType = product.tipo_producto || product.productType || ""
  const vendor = product.proveedor || product.vendor || ""
  const id = product.id || ""
  const shopifyId = product.shopify_id || (product.id && product.id.includes("gid://") ? product.id : null)

  // Formatear el precio
  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.parseFloat(price))

  // Formatear el precio de comparación
  const formattedCompareAtPrice = compareAtPrice
    ? new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(Number.parseFloat(compareAtPrice))
    : null

  // Determinar el color del badge según el estado
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus === "active") return "success"
    if (normalizedStatus === "draft") return "warning"
    if (normalizedStatus === "archived") return "destructive"
    return "secondary"
  }

  // Determinar el texto del estado
  const getStatusText = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus === "active") return "Activo"
    if (normalizedStatus === "draft") return "Borrador"
    if (normalizedStatus === "archived") return "Archivado"
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
        <Badge variant={getStatusColor(status) as any} className="absolute top-2 right-2">
          {getStatusText(status)}
        </Badge>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            {vendor && (
              <span className="flex items-center mr-3">
                <Tag className="h-3.5 w-3.5 mr-1" />
                {vendor}
              </span>
            )}
            {productType && (
              <span className="flex items-center">
                <Package className="h-3.5 w-3.5 mr-1" />
                {productType}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-baseline mt-2">
          <div className="font-semibold text-lg">{formattedPrice}</div>
          {formattedCompareAtPrice && (
            <div className="ml-2 text-sm text-muted-foreground line-through">{formattedCompareAtPrice}</div>
          )}
        </div>
        <div className="mt-2 text-sm">
          <span className={inventory <= 0 ? "text-destructive" : inventory < 5 ? "text-amber-500" : "text-emerald-600"}>
            {inventory <= 0 ? (
              <span className="flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Sin stock
              </span>
            ) : (
              `${inventory} en stock`
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/dashboard/products/${id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver detalles
          </Link>
        </Button>
        {shopifyId && (
          <SyncButton
            entityType="productos"
            shopifyId={shopifyId}
            variant="secondary"
            className="w-full sm:w-auto"
            size="sm"
          />
        )}
      </CardFooter>
    </Card>
  )
}
