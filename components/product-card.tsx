"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Edit, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    title: string
    status: string
    vendor: string
    productType: string
    featuredImage?: {
      url: string
    }
    images?: Array<{
      url: string
    }>
    variants?: Array<{
      price: string
    }>
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const cleanId = (id: string) => {
    if (!id) return ""
    if (id.includes("/")) {
      return id.split("/").pop() || ""
    }
    return id
  }

  const getImageUrl = () => {
    if (product.featuredImage?.url) return product.featuredImage.url
    if (product.images?.[0]?.url) return product.images[0].url
    return null
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(Number.parseFloat(amount))
  }

  const price = product.variants?.[0]?.price || "0"
  const imageUrl = getImageUrl()

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div
          className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-t-md overflow-hidden cursor-pointer"
          onClick={() => router.push(`/dashboard/products/${cleanId(product.id)}`)}
        >
          {imageUrl && !imageError ? (
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}

          <div className="absolute top-2 right-2">
            <Badge
              variant={product.status === "ACTIVE" ? "default" : "secondary"}
              className={
                product.status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""
              }
            >
              {product.status === "ACTIVE" ? "Activo" : product.status === "DRAFT" ? "Borrador" : "Archivado"}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-granito-600"
            onClick={() => router.push(`/dashboard/products/${cleanId(product.id)}`)}
          >
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{product.vendor}</p>
          <p className="text-xs text-muted-foreground">{product.productType}</p>
          <div className="mt-2">
            <span className="font-semibold text-lg">{formatCurrency(price)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/products/${cleanId(product.id)}`)}>
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${cleanId(product.id)}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${cleanId(product.id)}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
