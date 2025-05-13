import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CollectionCard({ collection }) {
  // Ensure we have all the necessary properties
  const { id = "", title = "Colección sin título", productsCount = 0, image = null } = collection || {}

  // Extract the numeric ID from the full Shopify ID
  const numericId = id.split("/").pop() || id

  return (
    <Link href={`/dashboard/collections/${numericId}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-square relative bg-muted">
          {image ? (
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
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">ID: {numericId}</CardFooter>
      </Card>
    </Link>
  )
}
