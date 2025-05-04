import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProductCard({ product }) {
  // Asegurarse de que el producto tiene todas las propiedades necesarias
  const { id, title = "Producto sin título", price = 0, status = "active", image = null } = product || {}

  // Formatear el precio correctamente
  const formattedPrice = typeof price === "number" ? `€${price.toFixed(2)}` : price || "€0.00"

  return (
    <Link href={`/dashboard/products/${id}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-square relative bg-muted">
          {image ? (
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold">{formattedPrice}</span>
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status === "active" ? "Activo" : "Borrador"}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">ID: {id?.split("/").pop() || id}</CardFooter>
      </Card>
    </Link>
  )
}
