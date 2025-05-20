"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Package } from "lucide-react"

export function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false)

  // Asegurarse de que el producto tiene todas las propiedades necesarias
  const {
    id,
    title = "Producto sin título",
    titulo = title, // Soporte para ambos nombres de propiedad
    price = 0,
    precio = price, // Soporte para ambos nombres de propiedad
    compareAtPrice,
    currencyCode = "EUR",
    status = "ACTIVE",
    estado = status, // Soporte para ambos nombres de propiedad
  } = product || {}

  // Intentar obtener la URL de la imagen de diferentes propiedades
  const imageUrl = getImageUrl(product)

  // Función para extraer el ID limpio
  const cleanId = (id) => {
    if (!id) return ""
    if (typeof id === "string" && id.includes("/")) {
      return id.split("/").pop()
    }
    return id
  }

  // Determinar si hay un descuento
  const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price)

  return (
    <Link href={`/dashboard/products/${cleanId(id)}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
        <div className="aspect-square relative bg-muted">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={titulo || title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Package className="h-12 w-12 text-granito-400" />
            </div>
          )}
          {(estado || status) !== "ACTIVE" && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                {(estado || status) === "DRAFT" ? "Borrador" : "Archivado"}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="font-medium line-clamp-1">{titulo || title}</h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-col">
              <span className="font-bold text-granito-700">{formatCurrency(precio || price, currencyCode)}</span>
              {hasDiscount && (
                <span className="text-sm line-through text-gray-500">
                  {formatCurrency(compareAtPrice, currencyCode)}
                </span>
              )}
            </div>
            {(estado || status) === "ACTIVE" && (
              <Badge variant="default" className="bg-granito-500 hover:bg-granito-600">
                Activo
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground mt-auto">
          <span className="truncate">ID: {cleanId(id)}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}

// Función auxiliar para obtener la URL de la imagen
function getImageUrl(product) {
  if (!product) return null

  // Intentar obtener la imagen de diferentes propiedades
  if (product.imagen) return product.imagen
  if (product.image) return typeof product.image === "string" ? product.image : product.image?.url || product.image?.src

  if (product.featuredImage) return product.featuredImage.url || product.featuredImage.src

  if (product.imagenes && product.imagenes.length > 0) {
    return product.imagenes[0].src || product.imagenes[0].url
  }

  if (product.images && product.images.length > 0) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url || product.images[0]?.src
  }

  // Si hay edges en las imágenes (formato GraphQL)
  if (product.images && product.images.edges && product.images.edges.length > 0) {
    return product.images.edges[0].node.url || product.images.edges[0].node.src
  }

  return null
}
