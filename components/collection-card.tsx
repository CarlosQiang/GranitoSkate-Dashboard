import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollectionCardProps {
  id: string
  title: string
  handle: string
  productsCount?: number
  image?: {
    url?: string
    altText?: string
  }
}

export function CollectionCard({ id, title, handle, productsCount = 0, image }: CollectionCardProps) {
  return (
    <Card className="overflow-hidden" data-collection-item>
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative bg-gray-100 flex items-center justify-center">
          {image?.url ? (
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.altText || title}
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">productos</p>
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
