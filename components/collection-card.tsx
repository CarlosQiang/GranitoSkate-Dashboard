import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Package } from "lucide-react"

export function CollectionCard({ collection }) {
  // Asegurarse de que la colección tiene todas las propiedades necesarias
  const { id = "", title = "Colección sin título", productsCount = 0, image = null } = collection || {}

  // Extraer el ID numérico si viene en formato gid://shopify/Collection/ID
  const numericId = id.includes("/") ? id.split("/").pop() : id

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square relative bg-muted">
        {image?.url ? (
          <Image
            src={image.url || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-muted-foreground">Sin imagen</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary">
            {productsCount} producto{productsCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="text-xs text-muted-foreground">ID: {numericId}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/collections/${numericId}`}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/collections/${numericId}/products`}>
              <Package className="h-4 w-4 mr-1" />
              Productos
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
