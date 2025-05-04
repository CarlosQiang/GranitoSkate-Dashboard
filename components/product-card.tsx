"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProductCard({ product, onDelete }) {
  // Asegurarse de que el producto tiene todas las propiedades necesarias
  const {
    id,
    numericId,
    title = "Producto sin título",
    price = 0,
    currencyCode = "EUR",
    status = "ACTIVE",
    featuredImage = null,
  } = product || {}

  // Obtener la URL de la imagen
  const imageUrl = featuredImage?.url || null

  // Usar el ID numérico para la URL
  const productId = numericId || id?.split("/").pop() || id

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square relative bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl || "/placeholder.svg"}
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
          <span className="font-bold">{formatCurrency(price, currencyCode)}</span>
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status === "ACTIVE" ? "Activo" : "Borrador"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">ID: {productId}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products/${productId}`}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
          {onDelete && (
            <Button variant="outline" size="sm" className="text-red-500" onClick={() => onDelete(id)}>
              <Trash className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
