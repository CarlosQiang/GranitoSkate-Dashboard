import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Edit, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CollectionCard({ collection }) {
  // Ensure we have all the necessary properties
  const { id = "", title = "Colección sin título", productsCount = 0, image = null } = collection || {}

  // Extract the numeric ID from the full Shopify ID
  const numericId = id.split("/").pop() || id

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative bg-gray-100">
        {image && image.url ? (
          <div className="w-full h-full relative">
            <img
              src={image.url || "/placeholder.svg"}
              alt={title}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Si la imagen falla, mostrar un icono de carpeta
                e.currentTarget.style.display = "none"
                e.currentTarget.parentElement.classList.add("flex", "items-center", "justify-center", "bg-gray-200")
                const icon = document.createElement("div")
                icon.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
                e.currentTarget.parentElement.appendChild(icon)
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <FolderOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary">
            {productsCount} producto{productsCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1 whitespace-nowrap">
          <Link href={`/dashboard/collections/${numericId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1 whitespace-nowrap">
          <Link href={`/dashboard/collections/${numericId}/products`}>
            <Package className="mr-2 h-4 w-4" />
            Productos
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
