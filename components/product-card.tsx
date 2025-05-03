import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  id: string
  title: string
  handle: string
  status?: string
  totalInventory?: number
  featuredImage?: {
    url?: string
    altText?: string
  }
}

export function ProductCard({ id, title, handle, status, totalInventory = 0, featuredImage }: ProductCardProps) {
  return (
    <Card className="overflow-hidden" data-product-item>
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative bg-gray-100 flex items-center justify-center">
          {featuredImage?.url ? (
            <img
              src={featuredImage.url || "/placeholder.svg"}
              alt={featuredImage.altText || title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {status && (
            <div className="absolute top-2 right-2">
              <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                {status === "ACTIVE" ? "Activo" : "Borrador"}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Inventario: {totalInventory !== undefined ? totalInventory : "No rastreado"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Más opciones</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
