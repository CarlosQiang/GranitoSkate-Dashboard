"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface RecentProductsProps {
  data?: Array<{
    id: string
    title: string
    handle: string
    status: string
    createdAt: string
    image: string | null
    price: string
    inventory: number
  }>
}

export function RecentProducts({ data = [] }: RecentProductsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No hay productos recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((product) => (
        <Card key={product.id} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center space-x-4">
              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                {product.image ? (
                  <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                    {product.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Stock: {product.inventory}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{Number.parseFloat(product.price).toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
